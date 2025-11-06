# Material Design 3 Quick Reference Card

## 🎨 Quick Start

### Import CSS (in main.tsx)
```typescript
import './styles/material-design-3.css';  // First!
import './index.css';
import './discord-theme.css';
```

## 🔘 Buttons

```tsx
// Filled (Primary)
<button className="md3-btn md3-btn-filled">Save</button>

// Outlined (Secondary)
<button className="md3-btn md3-btn-outlined">Cancel</button>

// Text (Tertiary)
<button className="md3-btn md3-btn-text">Learn More</button>

// Elevated
<button className="md3-btn md3-btn-elevated">Upload</button>

// Tonal
<button className="md3-btn md3-btn-tonal">Settings</button>
```

## 📇 Cards

```tsx
// Elevated (Default)
<div className="md3-card md3-card-elevated md3-p-md">Content</div>

// Filled
<div className="md3-card md3-card-filled md3-p-md">Content</div>

// Outlined
<div className="md3-card md3-card-outlined md3-p-md">Content</div>
```

## 📝 Inputs

```tsx
<input type="text" className="md3-text-field" placeholder="Enter..." />
```

## 🏷️ Chips

```tsx
<span className="md3-chip md3-chip-assist">Help</span>
<span className="md3-chip md3-chip-filter">Filter</span>
<span className="md3-chip md3-chip-filter-selected">Active</span>
<span className="md3-chip md3-chip-input">Tag</span>
```

## 📐 Typography

```tsx
<h1 className="md3-display-large">Display</h1>
<h2 className="md3-headline-large">Headline</h2>
<h3 className="md3-title-large">Title</h3>
<p className="md3-body-large">Body text</p>
<span className="md3-label-medium">Label</span>
```

## 📦 Layout

```tsx
// Flex
<div className="md3-flex md3-gap-md">Items</div>
<div className="md3-flex-col md3-gap-sm">Column</div>
<div className="md3-flex-center">Centered</div>
<div className="md3-flex-between">Spaced</div>

// Grid
<div className="md3-grid md3-grid-cols-3 md3-gap-md">
  <div>1</div><div>2</div><div>3</div>
</div>
```

## 📏 Spacing

```tsx
<div className="md3-p-xs">4px padding</div>
<div className="md3-p-sm">8px padding</div>
<div className="md3-p-md">16px padding</div>
<div className="md3-p-lg">24px padding</div>
<div className="md3-p-xl">32px padding</div>

<div className="md3-m-md md3-gap-lg">Margin & Gap</div>
```

## 🎨 Colors

```tsx
// Backgrounds
<div className="md3-bg-primary">Primary</div>
<div className="md3-bg-success">Success</div>
<div className="md3-bg-error">Error</div>

// Text
<span className="md3-text-primary">Primary</span>
<span className="md3-text-muted">Muted</span>

// Surfaces
<div className="md3-surface">Default</div>
<div className="md3-surface-light">Light</div>
```

## ⬆️ Elevation

```tsx
<div className="md3-elevation-1">Level 1</div>
<div className="md3-elevation-2">Level 2</div>
<div className="md3-elevation-3">Level 3</div>
```

## 🔄 Animation

```tsx
<div className="md3-fade-in">Fade in</div>
<div className="md3-slide-up">Slide up</div>
```

## 🎯 Common Patterns

### Full Page Layout
```tsx
<div className="md3-container md3-p-md">
  <h1 className="md3-headline-large md3-m-md">Page Title</h1>
  
  <div className="md3-grid md3-grid-cols-3 md3-gap-md">
    <div className="md3-card md3-card-elevated md3-p-md">
      <h3 className="md3-title-large">Card 1</h3>
      <p className="md3-body-medium">Content...</p>
    </div>
    {/* More cards... */}
  </div>
</div>
```

### Form
```tsx
<div className="md3-card md3-card-filled md3-p-lg">
  <h2 className="md3-title-large md3-m-md">Form Title</h2>
  
  <div className="md3-flex-col md3-gap-md">
    <input type="text" className="md3-text-field" placeholder="Name" />
    <input type="email" className="md3-text-field" placeholder="Email" />
    
    <div className="md3-flex md3-gap-md md3-flex-between">
      <button className="md3-btn md3-btn-outlined">Cancel</button>
      <button className="md3-btn md3-btn-filled">Submit</button>
    </div>
  </div>
</div>
```

### Dashboard Card
```tsx
<div className="md3-card md3-card-elevated md3-p-lg hover:shadow-elevation-2">
  <div className="md3-flex md3-flex-between md3-m-md">
    <h3 className="md3-title-large">Statistics</h3>
    <span className="md3-chip md3-chip-assist">View All</span>
  </div>
  
  <div className="md3-grid md3-grid-cols-2 md3-gap-md">
    <div className="md3-surface md3-p-md md3-rounded-md">
      <p className="md3-label-small md3-text-muted">Total Users</p>
      <p className="md3-headline-medium">1,234</p>
    </div>
    <div className="md3-surface md3-p-md md3-rounded-md">
      <p className="md3-label-small md3-text-muted">Active</p>
      <p className="md3-headline-medium">856</p>
    </div>
  </div>
</div>
```

## ⚠️ Important Rules

### DO ✅
- Use md3- prefixed classes for components
- Use semantic color classes (md3-bg-primary, not hardcoded colors)
- Follow MD3 spacing scale (4px increments)
- Include hover/focus states on interactive elements
- Test accessibility (keyboard navigation, screen readers)

### DON'T ❌
- Don't hardcode colors, use CSS variables
- Don't skip accessibility attributes
- Don't mix old and new button classes
- Don't ignore responsive breakpoints
- Don't create components without documentation

## 📚 Resources

- **Main Docs**: `docs/design-system/README.md`
- **Task Tracker**: `docs/design-system/TODO.md`
- **Rules**: `.cursorrules` (MD3 Implementation section)
- **Variables**: `src/styles/material-design-3.css`

## 🔗 Quick Links

- Material Design 3: https://m3.material.io/
- Tailwind CSS: https://tailwindcss.com/
- Dev Server: http://localhost:3000/

---

**Last Updated**: 2025-10-28  
**Version**: 1.0.0
