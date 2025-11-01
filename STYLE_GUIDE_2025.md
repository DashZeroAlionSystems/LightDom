# LightDom Style Guide

**Version**: 1.0.0  
**Last Updated**: 2025-10-27  
**Inspiration**: Exodus Wallet - Modern Dark Theme with Vibrant Accents

---

## 🎨 Design Philosophy

LightDom's design system combines the sophisticated dark aesthetic of Exodus wallet with vibrant, energetic accents that reflect our blockchain and mining focus. The design emphasizes:

- **Clarity**: Clean, readable interfaces with excellent contrast
- **Energy**: Vibrant gradients and animations that convey activity
- **Trust**: Professional appearance with consistent patterns
- **Innovation**: Modern components with subtle micro-interactions

---

## 🌈 Color Palette

### Primary Brand Colors
```css
/* Primary Blue - Main brand color */
--primary-50: #f0f9ff;
--primary-100: #e0f2fe;
--primary-200: #bae6fd;
--primary-300: #7dd3fc;
--primary-400: #38bdf8;
--primary-500: #0ea5e9; /* Main primary */
--primary-600: #0284c7;
--primary-700: #0369a1;
--primary-800: #075985;
--primary-900: #0c4a6e;
```

### Secondary Accent Colors
```css
--accent-purple: #8b5cf6;
--accent-pink: #ec4899;
--accent-green: #10b981;
--accent-orange: #f59e0b;
--accent-red: #ef4444;
--accent-cyan: #06b6d4;
--accent-teal: #14b8a6;
--accent-indigo: #6366f1;
```

### Dark Theme Colors
```css
--dark-background: #0a0a0a;
--dark-surface: #1a1a1a;
--dark-surface-light: #2a2a2a;
--dark-border: #333333;
--dark-border-light: #404040;
--dark-text: #ffffff;
--dark-text-secondary: #a0a0a0;
--dark-text-tertiary: #666666;
```

### Gradient System
```css
--gradient-primary: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%);
--gradient-secondary: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
--gradient-accent: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
--gradient-dark: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
--gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
--gradient-error: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

### Status Colors
```css
--status-success: #10b981;
--status-warning: #f59e0b;
--status-error: #ef4444;
--status-info: #0ea5e9;
--status-processing: #8b5cf6;
```

### Mining Rarity Colors
```css
--rarity-common: #94a3b8;
--rarity-uncommon: #22d3ee;
--rarity-rare: #3b82f6;
--rarity-epic: #8b5cf6;
--rarity-legendary: #f59e0b;
--rarity-mythical: #ef4444;
```

---

## 📝 Typography System

### Font Families
```css
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
--font-display: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Font Sizes
```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;
--text-5xl: 48px;
--text-6xl: 60px;
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## 📏 Spacing System

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
--space-4xl: 96px;
```

---

## 🔲 Border Radius System

```css
--radius-none: 0;
--radius-sm: 4px;
--radius-base: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

---

## 🌟 Shadow System

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-glow: 0 0 20px rgba(14, 165, 233, 0.3);
--shadow-glow-purple: 0 0 20px rgba(139, 92, 246, 0.3);
--shadow-glow-green: 0 0 20px rgba(16, 185, 129, 0.3);
```

---

## ⚡ Animation System

### Durations
```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### Easing Functions
```css
--ease: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Transitions
```css
--transition-all: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-colors: color 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-transform: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-opacity: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🎯 Component Guidelines

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--gradient-primary);
  border: none;
  color: var(--dark-text);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: var(--transition-all);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: var(--dark-surface);
  border: 1px solid var(--dark-border);
  color: var(--dark-text);
}

.btn-secondary:hover {
  background: var(--dark-surface-light);
  border-color: var(--primary-500);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  border: none;
  color: var(--dark-text-secondary);
}

.btn-ghost:hover {
  background: var(--dark-surface);
  color: var(--dark-text);
}
```

### Cards

#### Default Card
```css
.card {
  background: var(--dark-surface);
  border: 1px solid var(--dark-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-all);
}

.card:hover {
  border-color: var(--primary-500);
  box-shadow: var(--shadow-md);
}
```

#### Elevated Card
```css
.card-elevated {
  background: var(--dark-surface);
  border: 1px solid var(--dark-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.card-elevated:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

#### Glass Card
```css
.card-glass {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--dark-border-light);
  border-radius: var(--radius-lg);
}
```

### Inputs

```css
.input {
  background: var(--dark-surface);
  border: 1px solid var(--dark-border);
  border-radius: var(--radius-md);
  color: var(--dark-text);
}

.input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
}
```

---

## 🧭 Navigation Patterns

### Sidebar Navigation
```css
.sidebar {
  background: var(--dark-surface);
  border: 1px solid var(--dark-border);
  width: 280px;
}
```

### Rail Navigation
```css
.nav-rail {
  background: var(--dark-background);
  border: 1px solid var(--dark-border);
  width: 80px;
}
```

---

## 🎭 Icon System

### Feature Icons
- **Dashboard**: `DashboardOutlined`
- **Optimization**: `ThunderboltFilled`
- **Blockchain**: `WalletFilled`
- **Space Mining**: `GlobalFilled`
- **Metaverse**: `TrophyFilled`
- **SEO**: `SearchOutlined`
- **Analytics**: `BarChartOutlined`
- **Settings**: `SettingOutlined`

### Status Icons
- **Success**: `CheckCircleOutlined`
- **Warning**: `WarningOutlined`
- **Error**: `CloseCircleOutlined`
- **Info**: `InfoCircleOutlined`

### Rarity Icons
- **Common/Uncommon**: `StarOutlined`
- **Rare/Epic**: `DiamondOutlined`
- **Legendary/Mythical**: `CrownOutlined`

---

## 🎪 Interactive Elements

### Hover States
All interactive elements should have subtle hover states:
- Buttons: `translateY(-2px)` and enhanced shadow
- Cards: Border color change and shadow enhancement
- Links: Color transition to primary blue

### Loading States
- Use skeleton components for content loading
- Spin components with primary color
- Progress bars with gradient fills

### Micro-interactions
- Smooth color transitions (300ms)
- Subtle transform animations
- Glow effects on focus states

---

## 📱 Responsive Design

### Breakpoints
```css
--breakpoint-sm: 576px;
--breakpoint-md: 768px;
--breakpoint-lg: 992px;
--breakpoint-xl: 1200px;
--breakpoint-xxl: 1400px;
```

### Mobile Considerations
- Collapsible navigation rail
- Touch-friendly button sizes (minimum 44px)
- Simplified card layouts
- Optimized typography scaling

---

## 🎨 Dashboard Layout System

### Grid Structure
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
  padding: var(--space-lg);
}
```

### Section Spacing
- Page headers: `var(--space-2xl)` top padding
- Section dividers: `var(--space-xl)` vertical spacing
- Component gutters: `var(--space-lg)` horizontal spacing

---

## 🔧 Implementation Guidelines

### CSS Custom Properties
All design tokens should be defined as CSS custom properties for:
- Easy theming and customization
- Consistent values across components
- Runtime theme switching capability

### Component Composition
- Use composition over inheritance
- Implement consistent prop interfaces
- Provide default styling with customization options

### Performance Considerations
- Use CSS transforms for animations
- Implement efficient hover states
- Optimize gradient rendering
- Minimize reflows and repaints

---

## 📋 Usage Examples

### Primary Button Implementation
```jsx
<Button 
  className="btn-primary"
  size="large"
  icon={<RocketOutlined />}
>
  Start Mining
</Button>
```

### Feature Card Implementation
```jsx
<Card className="card-elevated feature-card">
  <Space direction="vertical">
    <ThunderboltFilled style={{ fontSize: 32, color: 'var(--primary-500)' }} />
    <Title level={4}>DOM Optimization</Title>
    <Text type="secondary">Advanced optimization algorithms</Text>
  </Space>
</Card>
```

### Mining Stats Implementation
```jsx
<Card className="card-glass">
  <Statistic
    title="Mining Hash Rate"
    value={2.4}
    suffix="TH/s"
    valueStyle={{ color: 'var(--status-success)' }}
  />
</Card>
```

---

## 🚀 Best Practices

### Do's
- ✅ Use semantic HTML5 elements
- ✅ Implement proper ARIA labels
- ✅ Maintain consistent spacing
- ✅ Use gradient backgrounds for CTAs
- ✅ Implement smooth transitions
- ✅ Test contrast ratios for accessibility

### Don'ts
- ❌ Use hard-coded colors
- ❌ Ignore mobile responsiveness
- ❌ Overuse animations
- ❌ Break the grid system
- ❌ Skip hover states
- ❌ Use inconsistent typography

---

## 🔄 Evolution Plan

### Phase 1: Foundation (Current)
- Core color system
- Typography scale
- Basic components
- Dark theme implementation

### Phase 2: Enhancement (Next)
- Light theme variant
- Advanced animations
- Component variants
- Accessibility improvements

### Phase 3: Expansion (Future)
- Custom theme builder
- Advanced personalization
- Motion design system
- Cross-platform consistency

---

## 📞 Support & Resources

### Design Files
- Figma design system: `LightDom_Design_System.fig`
- Icon library: `LightDom_Icons.svg`
- Component library: Storybook (coming soon)

### Development Resources
- Design system package: `@lightdom/design-system`
- CSS framework: Custom CSS with Ant Design integration
- Component documentation: Component Storybook

### Contact
- Design team: design@lightdom.io
- Development team: dev@lightdom.io
- Issues & feedback: GitHub Issues

---

**This style guide is a living document** and will be updated as our design system evolves. All contributors should follow these guidelines to ensure consistency across the LightDom platform.
