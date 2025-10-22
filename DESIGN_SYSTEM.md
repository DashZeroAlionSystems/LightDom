# LightDom Design System

Comprehensive design system inspired by **Exodus Wallet** and **Material Design 3** principles.

## 🎨 Overview

This design system provides a consistent, accessible, and modern visual language for the LightDom platform. It combines the sleek, gradient-rich aesthetic of Exodus wallet with the systematic approach of Material Design 3.

## 🌈 Color Palette

### Background Colors
- **Primary Background**: `#0A0E27` - Deep navy for main backgrounds
- **Secondary Background**: `#151A31` - Lighter navy for cards and panels
- **Tertiary Background**: `#1E2438` - Surface elements
- **Elevated Background**: `#252B45` - Elevated surfaces (modals, dropdowns)

### Accent Colors
**Blue Accent**
- Light: `#6C7BFF`
- Main: `#5865F2` (Primary blue)
- Dark: `#4752C4`

**Purple Accent**
- Light: `#9D7CFF`
- Main: `#7C5CFF` (Primary purple)
- Dark: `#6344D1`

### Gradients
- **Primary Gradient**: `linear-gradient(135deg, #5865F2 0%, #7C5CFF 100%)`
- **Secondary Gradient**: `linear-gradient(135deg, #6C7BFF 0%, #9D7CFF 100%)`
- **Hero Gradient**: `linear-gradient(135deg, #0A0E27 0%, #1E2438 50%, #252B45 100%)`
- **Card Gradient**: `linear-gradient(135deg, #151A31 0%, #1E2438 100%)`

### Text Colors
- **Primary**: `#FFFFFF` - Main headings and important text
- **Secondary**: `#B9BBBE` - Body text and descriptions
- **Tertiary**: `#72767D` - Hints and supplementary text
- **Disabled**: `#4F545C` - Disabled state

### Semantic Colors
- **Success**: `#3BA55C` - Positive actions and confirmations
- **Warning**: `#FAA61A` - Warnings and cautions
- **Error**: `#ED4245` - Errors and destructive actions
- **Info**: `#5865F2` - Informational messages

### Border Colors
- **Default**: `#2E3349`
- **Light**: `#40444B`
- **Focus**: `#5865F2`

## 📝 Typography

### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-heading: 'Montserrat', 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Scale
- `xs`: 0.75rem (12px)
- `sm`: 0.875rem (14px)
- `base`: 1rem (16px)
- `lg`: 1.125rem (18px)
- `xl`: 1.25rem (20px)
- `2xl`: 1.5rem (24px)
- `3xl`: 1.875rem (30px)
- `4xl`: 2.25rem (36px)
- `5xl`: 3rem (48px)
- `6xl`: 3.75rem (60px)

### Font Weights
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

### Line Heights
- Tight: 1.2
- Normal: 1.5
- Relaxed: 1.75

## 📏 Spacing

Uses an 8px base grid system:
- `1`: 4px
- `2`: 8px
- `3`: 12px
- `4`: 16px
- `5`: 20px
- `6`: 24px
- `8`: 32px
- `10`: 40px
- `12`: 48px
- `16`: 64px
- `20`: 80px
- `24`: 96px

## 🔲 Border Radius

- `sm`: 4px - Small elements
- `base`: 8px - Default
- `md`: 12px - Inputs
- `lg`: 16px - Cards
- `xl`: 24px - Large cards
- `2xl`: 32px - Modals
- `full`: 9999px - Pills and circles

## 🌑 Shadows

### Basic Shadows
- `sm`: Subtle elevation
- `base`: Standard elevation
- `md`: Moderate elevation
- `lg`: High elevation
- `xl`: Maximum elevation

### Special Shadows
- `glow`: `0 0 20px rgba(88, 101, 242, 0.4)` - Blue glow effect
- `glow-purple`: `0 0 20px rgba(124, 92, 255, 0.4)` - Purple glow effect

## ⚡ Animations

### Duration
- Fast: 150ms
- Base: 250ms
- Slow: 350ms

### Easing
- `ease-in-out` for most transitions
- `ease-out` for entrances
- `ease-in` for exits

### Predefined Animations
- `fadeIn`: Fade in effect (0.3s)
- `slideUp`: Slide up with fade (0.3s)
- `glow`: Pulsing glow effect (2s infinite)

## 🧩 Components

### Button

**Variants:**
- `primary`: Gradient background with glow on hover
- `secondary`: Surface background with border
- `outline`: Transparent with border
- `ghost`: Transparent with hover effect

**Sizes:**
- `sm`: Small buttons (32px height)
- `md`: Medium buttons (40px height)
- `lg`: Large buttons (48px height)

**Usage:**
```tsx
import { Button } from '@/components/ui/design-system';
import { ArrowRight } from 'lucide-react';

<Button variant="primary" size="md" icon={ArrowRight}>
  Get Started
</Button>
```

### Card

**Variants:**
- `default`: Standard surface
- `gradient`: Gradient background
- `elevated`: Enhanced with shadow

**Padding:**
- `sm`: 16px
- `md`: 24px
- `lg`: 32px

**Usage:**
```tsx
import { Card } from '@/components/ui/design-system';

<Card variant="gradient" padding="lg" hoverable>
  <h3>Card Title</h3>
  <p>Card content...</p>
</Card>
```

### Input

**Features:**
- Label support
- Icon support
- Error state
- Focus states
- Disabled state

**Usage:**
```tsx
import { Input } from '@/components/ui/design-system';
import { Mail } from 'lucide-react';

<Input 
  label="Email"
  type="email"
  placeholder="Enter your email"
  icon={Mail}
  error={errors.email}
/>
```

## 📱 Responsive Design

### Breakpoints
- `xs`: 475px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Best Practices
- Mobile-first approach
- Use relative units (rem, em) for typography
- Maintain 16px minimum font size on mobile
- Ensure touch targets are at least 44x44px

## ♿ Accessibility

### Color Contrast
- All text colors meet WCAG AA standards (4.5:1 for normal text)
- Focus states are clearly visible with 2px outline
- Interactive elements have distinct hover states

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators are always visible
- Logical tab order throughout the application

### Screen Readers
- Semantic HTML elements used throughout
- ARIA labels where needed
- Meaningful alt text for images

## 🎯 Usage Guidelines

### DO's
✅ Use gradient backgrounds for primary actions
✅ Maintain consistent spacing using the 8px grid
✅ Use semantic colors for status indicators
✅ Apply smooth transitions to interactive elements
✅ Ensure sufficient color contrast for text

### DON'Ts
❌ Don't use multiple gradient styles in the same section
❌ Don't override border radius values arbitrarily
❌ Don't use colors outside the defined palette
❌ Don't skip focus states for accessibility
❌ Don't use text smaller than 12px

## 🔧 Implementation

### Tailwind Configuration
The design system is integrated with Tailwind CSS. Use the configured classes:

```tsx
// Background
className="bg-background-primary"
className="bg-surface"

// Accent colors
className="text-accent-blue"
className="border-accent-purple"

// Gradients
className="bg-gradient-primary"

// Effects
className="hover:shadow-glow"
className="animate-fade-in"
```

### CSS Variables
Available as CSS custom properties:

```css
background-color: var(--bg-primary);
color: var(--text-primary);
border-color: var(--border);
```

## 📚 Resources

- [Exodus Wallet Design Reference](https://www.exodus.com/)
- [Material Design 3 Guidelines](https://m3.material.io/)
- [Design System Configuration](./src/styles/design-system.ts)
- [Tailwind Config](./tailwind.config.js)

## 🔄 Updates and Maintenance

This design system is a living document. When making updates:

1. Document changes in this file
2. Update the design system configuration
3. Test changes across all components
4. Ensure backwards compatibility when possible
5. Notify the team of breaking changes

## 📞 Support

For questions or suggestions about the design system, please open an issue or contact the design team.

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-22
