# LightDom Design System - Quick Reference

## Quick Start

```css
/* Import the design system */
@import './styles/design-tokens.css';
@import './styles/component-system.css';
@import './styles/animations.css';
```

## Common Patterns

### Button
```jsx
<button className="ld-btn ld-btn--primary ld-btn--md ld-hover-lift">
  Click me
</button>
```

### Card
```jsx
<div className="ld-card ld-card--interactive ld-animate-scale-in">
  <div className="ld-card__header">
    <h3 className="ld-card__title">Card Title</h3>
  </div>
  <div className="ld-card__content">
    Card content goes here
  </div>
</div>
```

### Input
```jsx
<input 
  type="text" 
  placeholder="Enter text" 
  className="ld-input ld-focus-ring"
/>
```

### Layout
```jsx
<div className="ld-container ld-container--lg">
  <div className="ld-grid ld-grid--cols-3 ld-grid--gap-md">
    <div className="ld-card">Item 1</div>
    <div className="ld-card">Item 2</div>
    <div className="ld-card">Item 3</div>
  </div>
</div>
```

## Color Classes

| Class | Color | Usage |
|-------|-------|-------|
| `ld-text-primary` | `#ffffff` | Primary text |
| `ld-text-secondary` | `#b9bbbe` | Secondary text |
| `ld-text-muted` | `#72767d` | Muted text |
| `ld-text-success` | `#3ba55c` | Success text |
| `ld-text-warning` | `#faa81a` | Warning text |
| `ld-text-danger` | `#ed4245` | Error text |

## Button Variants

| Class | Style | Usage |
|-------|-------|-------|
| `ld-btn--primary` | Blue background | Primary actions |
| `ld-btn--secondary` | Gray background | Secondary actions |
| `ld-btn--success` | Green background | Success actions |
| `ld-btn--danger` | Red background | Destructive actions |
| `ld-btn--ghost` | Transparent | Subtle actions |

## Button Sizes

| Class | Height | Padding | Usage |
|-------|--------|---------|-------|
| `ld-btn--sm` | 32px | 8px 16px | Small buttons |
| `ld-btn--md` | 40px | 12px 20px | Standard buttons |
| `ld-btn--lg` | 48px | 16px 24px | Large buttons |

## Animation Classes

### Entrance Animations
- `ld-animate-fade-in` - Fade in
- `ld-animate-slide-up` - Slide up from bottom
- `ld-animate-slide-down` - Slide down from top
- `ld-animate-slide-left` - Slide in from right
- `ld-animate-slide-right` - Slide in from left
- `ld-animate-scale-in` - Scale up
- `ld-animate-bounce-in` - Bounce in

### Hover Animations
- `ld-hover-lift` - Lift on hover
- `ld-hover-glow` - Glow on hover
- `ld-hover-scale` - Scale on hover
- `ld-hover-rotate` - Rotate on hover

### Continuous Animations
- `ld-animate-pulse` - Pulse effect
- `ld-animate-float` - Float effect
- `ld-animate-glow` - Glow effect

## Layout Classes

### Containers
- `ld-container` - Responsive container
- `ld-container--sm` - 640px max-width
- `ld-container--md` - 768px max-width
- `ld-container--lg` - 1024px max-width
- `ld-container--xl` - 1280px max-width
- `ld-container--2xl` - 1536px max-width

### Grid
- `ld-grid` - CSS Grid container
- `ld-grid--cols-1` to `ld-grid--cols-6` - Column count
- `ld-grid--gap-sm` - Small gap (8px)
- `ld-grid--gap-md` - Medium gap (16px)
- `ld-grid--gap-lg` - Large gap (24px)

### Flexbox
- `ld-flex` - Flexbox container
- `ld-flex--col` - Column direction
- `ld-flex--row` - Row direction
- `ld-flex--center` - Center alignment
- `ld-flex--between` - Space between
- `ld-flex--around` - Space around
- `ld-flex--evenly` - Space evenly

## Spacing Classes

### Margins
- `ld-mt-1` to `ld-mt-8` - Margin top
- `ld-mb-1` to `ld-mb-8` - Margin bottom
- `ld-ml-1` to `ld-ml-8` - Margin left
- `ld-mr-1` to `ld-mr-8` - Margin right

### Padding
- `ld-p-1` to `ld-p-8` - All sides padding
- `ld-px-1` to `ld-px-8` - Horizontal padding
- `ld-py-1` to `ld-py-8` - Vertical padding

## Typography Classes

### Font Sizes
- `ld-text-xs` - 12px
- `ld-text-sm` - 14px
- `ld-text-md` - 16px
- `ld-text-lg` - 18px
- `ld-text-xl` - 20px
- `ld-text-2xl` - 24px
- `ld-text-3xl` - 30px

### Font Weights
- `ld-font-light` - 300
- `ld-font-normal` - 400
- `ld-font-medium` - 500
- `ld-font-semibold` - 600
- `ld-font-bold` - 700
- `ld-font-extrabold` - 800

## Common Combinations

### Hero Section
```jsx
<div className="ld-container ld-container--xl ld-py-8 ld-animate-fade-in">
  <h1 className="ld-text-3xl ld-font-bold ld-text-primary ld-mb-4">
    Hero Title
  </h1>
  <p className="ld-text-lg ld-text-secondary ld-mb-8">
    Hero description
  </p>
  <button className="ld-btn ld-btn--primary ld-btn--lg ld-hover-glow">
    Get Started
  </button>
</div>
```

### Stats Grid
```jsx
<div className="ld-grid ld-grid--cols-4 ld-grid--gap-lg">
  {stats.map(stat => (
    <div key={stat.id} className="ld-card ld-card--interactive ld-animate-scale-in ld-hover-lift">
      <div className="ld-text-2xl ld-font-bold ld-text-primary">
        {stat.value}
      </div>
      <div className="ld-text-sm ld-text-secondary">
        {stat.label}
      </div>
    </div>
  ))}
</div>
```

### Form
```jsx
<form className="ld-card ld-card--elevated ld-animate-slide-up">
  <div className="ld-card__header">
    <h2 className="ld-card__title">Form Title</h2>
  </div>
  <div className="ld-card__content">
    <input 
      type="email" 
      placeholder="Email" 
      className="ld-input ld-mb-4"
    />
    <input 
      type="password" 
      placeholder="Password" 
      className="ld-input ld-mb-6"
    />
    <button className="ld-btn ld-btn--primary ld-btn--md ld-hover-lift">
      Submit
    </button>
  </div>
</form>
```

## Best Practices

1. **Use semantic HTML** with design system classes
2. **Combine classes logically** - layout, then styling, then animations
3. **Test hover states** on all interactive elements
4. **Use appropriate animation classes** for better UX
5. **Maintain consistent spacing** using the spacing scale
6. **Follow the color hierarchy** for text and backgrounds
7. **Test on multiple screen sizes** for responsive design

## Troubleshooting

### Common Issues

1. **Classes not applying**: Check if CSS files are imported
2. **Animations not working**: Ensure animation classes are applied correctly
3. **Hover effects not showing**: Check if hover classes are properly applied
4. **Layout issues**: Verify container and grid classes are correct

### Debug Tips

1. **Use browser dev tools** to inspect applied styles
2. **Check CSS specificity** if styles are being overridden
3. **Verify class names** are spelled correctly
4. **Test in different browsers** for compatibility issues
