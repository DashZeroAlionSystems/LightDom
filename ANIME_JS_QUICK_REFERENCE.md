# Anime.js Integration - Quick Reference

## 🚀 Quick Start

```bash
# View in Storybook
npm run storybook

# Navigate to:
# - Design System/Animation Controls
# - Product Pages/Product Overview  
# - Product Pages/Product Drill-Down
# - Design System/Theme Configurator
```

## 📦 What's Included

### 1. Animation Utilities (`src/utils/animeControls.ts`)

```tsx
import {
  // Product animations
  productHeroEntrance,
  featureCardsStagger,
  product3DRotation,
  productFloating,
  
  // Data animations
  animatedCounter,
  progressBarAnimation,
  chartBarsAnimation,
  
  // Interactive
  buttonMagnetic,
  rippleEffect,
  
  // SVG
  svgDrawAnimation,
  svgMorphAnimation,
  
  // Text
  textRevealAnimation,
  typewriterAnimation,
  
  // Utilities
  createControlledAnimation,
  createTimeline,
  createScrollAnimation,
  prefersReducedMotion,
} from '@/utils/animeControls';
```

### 2. Theme System (`src/config/themeConfig.ts`)

```tsx
import {
  defaultTheme,
  themePresets,
  applyTheme,
  getGradient,
  exportTheme,
  importTheme,
} from '@/config/themeConfig';

// Apply theme
applyTheme(themePresets.ocean);

// Get gradient
const gradient = getGradient(defaultTheme, 135);

// Export/Import
const json = exportTheme(defaultTheme);
const theme = importTheme(json);
```

### 3. Components

```tsx
import { AnimationControls } from '@/components/AnimationControls';
import { ProductOverview } from '@/components/ProductOverview';
import { ProductDrillDown } from '@/components/ProductDrillDown';
import { ThemeConfigurator } from '@/components/ThemeConfigurator';
```

## 💡 Common Patterns

### Basic Animation

```tsx
import { featureCardsStagger } from '@/utils/animeControls';

const anim = featureCardsStagger('.card', {
  duration: 800,
  easing: 'easeOutExpo',
  stagger: 100,
});

anim.play();
```

### Controlled Animation

```tsx
import { createControlledAnimation } from '@/utils/animeControls';

const anim = createControlledAnimation({
  targets: '.element',
  translateY: [0, 100],
  opacity: [1, 0],
  duration: 1000,
});

// Full control
anim.play();
anim.pause();
anim.restart();
anim.reverse();
anim.seek(500);
```

### Timeline Sequence

```tsx
import { createTimeline } from '@/utils/animeControls';

const tl = createTimeline();

tl.add({
  targets: '.step-1',
  opacity: [0, 1],
  duration: 500,
})
.add({
  targets: '.step-2',
  translateX: [-100, 0],
  duration: 500,
}, '-=200') // Overlap by 200ms
.add({
  targets: '.step-3',
  scale: [0, 1],
  duration: 500,
});
```

### Scroll-triggered

```tsx
import { createScrollAnimation } from '@/utils/animeControls';

createScrollAnimation(
  '.scroll-element',
  {
    opacity: [0, 1],
    translateY: [40, 0],
    duration: 800,
  },
  0.6 // Trigger at 60% visible
);
```

### With Theme

```tsx
import { defaultTheme } from '@/config/themeConfig';
import anime from 'animejs';

anime({
  targets: '.element',
  background: [
    defaultTheme.colors.primary,
    defaultTheme.colors.secondary
  ],
  duration: defaultTheme.animations.duration.normal,
  easing: defaultTheme.animations.easing.spring,
});
```

## 🎨 CSS Variables

```css
.component {
  background: var(--theme-primary);
  color: var(--theme-text);
  padding: var(--theme-spacing-md);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.gradient {
  background: linear-gradient(
    135deg,
    var(--theme-primary) 0%,
    var(--theme-secondary) 100%
  );
}
```

## ⚡ Performance Tips

1. **Animate transform & opacity** - Use `transform` and `opacity` for best performance
2. **Use will-change** - Add `will-change: transform, opacity` for complex animations
3. **Respect reduced motion** - Always check `prefersReducedMotion()`
4. **Cleanup** - Stop animations when components unmount

```tsx
useEffect(() => {
  const anim = featureCardsStagger('.card');
  anim.play();
  
  return () => anim.pause(); // Cleanup
}, []);
```

## 📚 Animation Presets

### Durations
- **instant**: 100ms - Icon changes
- **fast**: 200ms - Micro-interactions
- **normal**: 400ms - Component transitions
- **slow**: 800ms - Complex animations

### Easings
- **easeOutExpo**: Natural, default
- **easeOutElastic**: Playful, bouncy
- **easeOutQuad**: Subtle, professional
- **linear**: Progress bars

### Stagger Delays
- **fast**: 50ms - Small lists
- **normal**: 100ms - Cards, features
- **slow**: 200ms - Large galleries

## 🎯 Component Props

### AnimationControls
```tsx
<AnimationControls 
  demoMode="product"  // 'product' | 'data' | 'svg' | 'text' | 'interactive'
  showCode={true}     // Show code examples
/>
```

### ProductOverview
```tsx
<ProductOverview 
  productName="LightDom"
  tagline="Amazing Product"
  description="Full description..."
/>
```

### ThemeConfigurator
```tsx
<ThemeConfigurator 
  onThemeChange={(theme) => console.log(theme)}
/>
```

## 🔗 Resources

- [Full Documentation](./ANIME_JS_IMPLEMENTATION.md)
- [Anime.js Docs](https://animejs.com/documentation/)
- [Storybook Stories](http://localhost:6006/)

## 🆘 Troubleshooting

**Animation not working?**
- Check console for errors
- Ensure targets exist in DOM
- Verify anime.js is imported correctly

**Performance issues?**
- Reduce number of animated elements
- Use `will-change` sparingly
- Check if reduced motion is preferred

**TypeScript errors?**
- Use `any` type for complex anime configs
- Import directly: `import anime from 'animejs'`

## 📝 Examples

See Storybook for live examples:
```bash
npm run storybook
```

All components have multiple stories showing different configurations!
