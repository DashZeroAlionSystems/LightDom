# Design Visual Reference

## Color Swatches

### Background Colors
```
████████  #0A0E27  Primary Background (Deep Navy)
████████  #151A31  Secondary Background (Card surfaces)
████████  #1E2438  Tertiary Background (Elevated elements)
████████  #252B45  Elevated Background (Modals, dropdowns)
```

### Accent Colors - Blue
```
████████  #6C7BFF  Light Blue (Hover states)
████████  #5865F2  Primary Blue (Main accent, buttons)
████████  #4752C4  Dark Blue (Active states)
```

### Accent Colors - Purple
```
████████  #9D7CFF  Light Purple (Highlights)
████████  #7C5CFF  Primary Purple (Secondary accent)
████████  #6344D1  Dark Purple (Depth)
```

### Text Colors
```
████████  #FFFFFF  Primary Text (Headings, important text)
████████  #B9BBBE  Secondary Text (Body text)
████████  #72767D  Tertiary Text (Hints, labels)
████████  #4F545C  Disabled Text
```

### Semantic Colors
```
████████  #3BA55C  Success (Green - confirmations)
████████  #FAA61A  Warning (Orange - cautions)
████████  #ED4245  Error (Red - errors)
████████  #5865F2  Info (Blue - information)
```

### Border Colors
```
████████  #2E3349  Default Border
████████  #40444B  Light Border (Hover)
████████  #5865F2  Focus Border (Accent blue)
```

## Gradient Examples

### Primary Gradient (Buttons, CTAs)
```
Left (#5865F2) → Right (#7C5CFF)
████████████████████████████████
```

### Secondary Gradient (Highlights)
```
Left (#6C7BFF) → Right (#9D7CFF)
████████████████████████████████
```

### Hero Gradient (Large sections)
```
Left (#0A0E27) → Center (#1E2438) → Right (#252B45)
████████████████████████████████
```

### Card Gradient (Surface elements)
```
Left (#151A31) → Right (#1E2438)
████████████████████████████████
```

## Typography Hierarchy

```
Hero Heading (60px / 3.75rem)
████████████████████████

H1 Heading (48px / 3rem)
███████████████████

H2 Heading (36px / 2.25rem)
██████████████

H3 Heading (30px / 1.875rem)
████████████

H4 Heading (24px / 1.5rem)
██████████

Body Large (18px / 1.125rem)
████████

Body Base (16px / 1rem)
███████

Body Small (14px / 0.875rem)
██████

Caption (12px / 0.75rem)
█████
```

## Component Examples

### Button Variants

```
┌─────────────────────────┐
│   Primary Button        │  ← Gradient background #5865F2 → #7C5CFF
│   with glow effect      │
└─────────────────────────┘

┌─────────────────────────┐
│   Secondary Button      │  ← Surface background with border
└─────────────────────────┘

┌─────────────────────────┐
│   Outline Button        │  ← Transparent with blue border
└─────────────────────────┘

   Ghost Button             ← Transparent, text only
```

### Card Variants

```
┌──────────────────────────────┐
│                              │
│   Default Card               │  ← Surface background
│   with border                │
│                              │
└──────────────────────────────┘

┌──────────────────────────────┐
│                              │
│   Gradient Card              │  ← Gradient background
│   with smooth transition     │
│                              │
└──────────────────────────────┘

┌──────────────────────────────┐
│                              │
│   Elevated Card              │  ← Enhanced shadow
│   floating effect            │
│                              │
└──────────────────────────────┘
```

### Input Field States

```
Normal State:
┌─────────────────────────────────┐
│  📧  Enter your email           │
└─────────────────────────────────┘

Focus State (Blue glow):
┌═════════════════════════════════┐
│  📧  Enter your email           │
└═════════════════════════════════┘

Error State (Red border):
┌─────────────────────────────────┐
│  📧  Enter your email           │
└─────────────────────────────────┘
  ⚠️ Email is required
```

## Layout Grid

### Spacing System (8px base)
```
4px   ████
8px   ████████
12px  ████████████
16px  ████████████████
24px  ████████████████████████
32px  ████████████████████████████████
48px  ████████████████████████████████████████████████
```

### Responsive Breakpoints
```
Mobile       0px   →  640px   ▓▓▓▓░░░░░░░░░░░░
Tablet       640px →  1024px  ░░░░▓▓▓▓▓▓░░░░░░
Desktop      1024px → 1280px  ░░░░░░░░░░▓▓▓▓░░
Large        1280px+          ░░░░░░░░░░░░░░▓▓
```

## Animation Curves

### Fade In (300ms)
```
Opacity: 0 ──────────────────────→ 1
         0ms                    300ms
```

### Slide Up (300ms)
```
Position: 10px ──────────────────→ 0px
Opacity:  0    ──────────────────→ 1
          0ms                   300ms
```

### Glow Effect (2s loop)
```
Shadow: 5px ←─────────────────────→ 20px
        0s          1s           2s
```

### Hover Scale (200ms)
```
Scale: 1.0 ─────────────→ 1.05
       0ms            200ms
```

## Iconography

Icons use Lucide React library with consistent sizing:

```
Small Icon    16px × 16px  ▪
Medium Icon   20px × 20px  ◼
Large Icon    24px × 24px  ■
XL Icon       32px × 32px  ▮
```

## Shadow Levels

```
Small Shadow (Subtle)
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
████████████████
▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

Medium Shadow (Standard)
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
████████████████
▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

Large Shadow (Elevated)
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
████████████████
▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

Glow Shadow (Special)
░░░░░░░░░░░░░░░
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
████████████████
▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
░░░░░░░░░░░░░░░
```

## Border Radius Scale

```
Small      4px   ╭─╮
                 ╰─╯

Base       8px   ╭──╮
                 ╰──╯

Medium     12px  ╭───╮
                 ╰───╯

Large      16px  ╭────╮
                 ╰────╯

XL         24px  ╭──────╮
                 ╰──────╯

Full       ∞     ●
```

## Landing Page Sections

```
┌──────────────────────────────────────────┐
│                                          │
│             HERO SECTION                 │
│         (Animated background)            │
│                                          │
│       [Primary CTA]  [Secondary CTA]     │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│          STATS GRID (4 columns)          │
│    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│    │50K+ │ │ 2M+ │ │ $5M+│ │ 20+ │     │
│    └─────┘ └─────┘ └─────┘ └─────┘     │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│         FEATURES SECTION                 │
│    ┌────────────┐ ┌────────────┐        │
│    │  Feature 1 │ │  Feature 2 │        │
│    └────────────┘ └────────────┘        │
│    ┌────────────┐ ┌────────────┐        │
│    │  Feature 3 │ │  Feature 4 │        │
│    └────────────┘ └────────────┘        │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│          PRICING SECTION                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Starter │ │   Pro   │ │Enterprise│   │
│  │  Free   │ │  $29/mo │ │  Custom  │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│           CTA SECTION                    │
│         [Get Started Now]                │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│             FOOTER                       │
│    Product | Resources | Company         │
│                                          │
└──────────────────────────────────────────┘
```

## Dashboard Layout

```
┌──────────────────────────────────────────┐
│  HEADER (Sticky)                         │
│  Logo | Title              Status | ⚙️   │
├──────────────────────────────────────────┤
│                                          │
│  STATS GRID (Responsive)                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │Active│ │Space │ │Tokens│ │ Rank │   │
│  │ 1247 │ │446 KB│ │12345 │ │  #42 │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│                                          │
│  CONTROL PANEL                           │
│  ┌──────────────────────────────┐       │
│  │ Crawler Control              │       │
│  │ [▶️ Start] [History]         │       │
│  └──────────────────────────────┘       │
│                                          │
│  QUICK ACTIONS                           │
│  ┌──────────────────────────────┐       │
│  │ [Space Mining]               │       │
│  │ [Metaverse Mining]           │       │
│  │ [Space Optimization]         │       │
│  └──────────────────────────────┘       │
│                                          │
└──────────────────────────────────────────┘
```

## Design Inspiration

This design system draws inspiration from:

**Exodus Wallet**
- Deep navy backgrounds
- Blue-purple gradient accents
- Clean, modern typography
- Smooth animations
- Professional crypto wallet aesthetic

**Material Design 3**
- Systematic color approach
- Clear component hierarchy
- Accessibility focus
- Responsive design principles
- Consistent spacing

## Usage Quick Reference

```css
/* Background */
.bg-primary     → #0A0E27
.bg-surface     → #151A31

/* Text */
.text-primary   → #FFFFFF
.text-secondary → #B9BBBE

/* Accent */
.bg-gradient-primary → Linear gradient blue to purple
.text-accent-blue    → #5865F2

/* Border */
.border          → #2E3349
.border-focus    → #5865F2

/* Effects */
.hover:shadow-glow → Blue glow on hover
.animate-fade-in   → Fade in animation
```

---

**Note**: All colors and measurements are design tokens that can be accessed through CSS variables or Tailwind classes. This reference serves as a visual guide for designers and developers implementing the LightDom design system.
