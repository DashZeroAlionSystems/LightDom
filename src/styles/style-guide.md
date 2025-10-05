# LightDom Space-Bridge Platform - Comprehensive Style Guide

## 🎨 **Design System Overview**

The LightDom Space-Bridge platform uses a modern, accessible, and user-friendly design system built on the latest UI trends and best practices. This comprehensive style guide ensures consistency across all components and provides a foundation for creating beautiful, functional interfaces.

## 🎯 **Design Principles**

### **1. Modern & Futuristic**
- Clean, minimalist design with subtle gradients and shadows
- Glassmorphism effects for depth and visual interest
- Smooth animations and micro-interactions
- Cutting-edge visual elements that reflect blockchain technology

### **2. Accessible & Inclusive**
- WCAG 2.1 AA compliance for all components
- High contrast ratios for text and backgrounds
- Keyboard navigation support
- Screen reader compatibility
- Responsive design for all devices

### **3. User-Friendly**
- Intuitive navigation and information architecture
- Clear visual hierarchy and typography
- Consistent interaction patterns
- Helpful feedback and loading states
- Error prevention and recovery

### **4. Performance-Focused**
- Optimized animations and transitions
- Efficient CSS with minimal bundle size
- GPU-accelerated animations where appropriate
- Reduced motion support for accessibility

## 🌈 **Color System**

### **Primary Colors**
```css
--color-primary: #0ea5e9;        /* Main brand color */
--color-primary-hover: #0284c7;  /* Hover state */
--color-primary-active: #0369a1;  /* Active state */
--color-primary-light: #e0f2fe;  /* Light variant */
--color-primary-dark: #075985;    /* Dark variant */
```

### **Secondary Colors**
```css
--color-secondary: #a855f7;       /* Purple accent */
--color-secondary-hover: #9333ea;
--color-secondary-active: #7c3aed;
--color-secondary-light: #f3e8ff;
--color-secondary-dark: #6b21a8;
```

### **Accent Colors**
```css
--color-accent: #ec4899;          /* Pink accent */
--color-accent-hover: #db2777;
--color-accent-active: #be185d;
--color-accent-light: #fce7f3;
--color-accent-dark: #9d174d;
```

### **Semantic Colors**
```css
--color-success: #22c55e;         /* Success states */
--color-warning: #f59e0b;         /* Warning states */
--color-error: #ef4444;           /* Error states */
```

### **Neutral Colors**
```css
--color-background: #ffffff;      /* Main background */
--color-surface: #f8fafc;         /* Card backgrounds */
--color-surface-elevated: #ffffff; /* Elevated surfaces */
--color-border: #e2e8f0;          /* Borders */
--color-text: #0f172a;            /* Primary text */
--color-text-secondary: #475569;  /* Secondary text */
--color-text-tertiary: #94a3b8;   /* Tertiary text */
```

### **Dark Mode Colors**
```css
--color-background: #0a0a0a;      /* Dark background */
--color-surface: #111111;         /* Dark surfaces */
--color-surface-elevated: #1a1a1a; /* Dark elevated */
--color-border: #262626;          /* Dark borders */
--color-text: #ffffff;            /* Dark text */
--color-text-secondary: #a3a3a3;  /* Dark secondary */
--color-text-tertiary: #737373;    /* Dark tertiary */
```

## 📝 **Typography**

### **Font Families**
- **Primary**: Inter (system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)
- **Monospace**: JetBrains Mono (Fira Code, Monaco, Consolas, monospace)
- **Display**: Cal Sans (Inter, system-ui, sans-serif)

### **Font Sizes**
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

### **Font Weights**
```css
--font-thin: 100;
--font-extralight: 200;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

### **Line Heights**
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

## 📏 **Spacing System**

### **Spacing Scale**
```css
--spacing-0: 0px;
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
--spacing-20: 5rem;      /* 80px */
--spacing-24: 6rem;      /* 96px */
--spacing-32: 8rem;      /* 128px */
```

## 🔲 **Border Radius**

### **Radius Scale**
```css
--radius-none: 0px;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-3xl: 1.5rem;   /* 24px */
--radius-full: 9999px;   /* Fully rounded */
```

## 🌟 **Shadows**

### **Shadow Scale**
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### **Colored Shadows**
```css
--shadow-primary: 0 4px 14px 0 rgb(14 165 233 / 0.15);
--shadow-secondary: 0 4px 14px 0 rgb(168 85 247 / 0.15);
--shadow-accent: 0 4px 14px 0 rgb(236 72 153 / 0.15);
--shadow-success: 0 4px 14px 0 rgb(34 197 94 / 0.15);
--shadow-warning: 0 4px 14px 0 rgb(245 158 11 / 0.15);
--shadow-error: 0 4px 14px 0 rgb(239 68 68 / 0.15);
```

## ⚡ **Animations**

### **Duration**
```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### **Easing Functions**
```css
--easing-linear: linear;
--easing-ease: ease;
--easing-ease-in: ease-in;
--easing-ease-out: ease-out;
--easing-ease-in-out: ease-in-out;
--easing-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--easing-snappy: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### **Animation Classes**
- `animate-fadeIn` - Fade in animation
- `animate-slideInUp` - Slide in from bottom
- `animate-slideInDown` - Slide in from top
- `animate-slideInLeft` - Slide in from left
- `animate-slideInRight` - Slide in from right
- `animate-scaleIn` - Scale in animation
- `animate-bounce` - Bounce animation
- `animate-pulse` - Pulse animation
- `animate-spin` - Spin animation
- `animate-gradient` - Gradient animation

## 📱 **Responsive Design**

### **Breakpoints**
```css
--breakpoint-xs: 320px;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### **Mobile-First Approach**
- Design for mobile devices first
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Optimized for thumb navigation

## 🎭 **Component Guidelines**

### **Buttons**
- **Primary**: Main actions, high emphasis
- **Secondary**: Secondary actions, medium emphasis
- **Accent**: Special actions, brand emphasis
- **Ghost**: Subtle actions, low emphasis
- **Outline**: Alternative actions, medium emphasis

### **Cards**
- **Default**: Standard content containers
- **Elevated**: Important content with shadow
- **Outlined**: Subtle content with border
- **Filled**: Background content
- **Gradient**: Special content with gradient

### **Inputs**
- Clear labels and helper text
- Validation states (success, warning, error)
- Consistent sizing and spacing
- Focus states with ring indicators
- Placeholder text for guidance

### **Modals**
- Centered positioning
- Backdrop blur effect
- Smooth animations
- Keyboard navigation
- Escape key to close

### **Tooltips**
- Contextual help and information
- Consistent positioning
- Accessible implementation
- Smooth animations
- Clear typography

## 🌙 **Dark Mode**

### **Implementation**
- CSS custom properties for dynamic theming
- Automatic system preference detection
- Manual toggle option
- Smooth transitions between modes
- Consistent contrast ratios

### **Dark Mode Colors**
- Dark backgrounds with subtle gradients
- High contrast text for readability
- Muted accent colors for reduced eye strain
- Consistent shadow and border treatments

## ♿ **Accessibility**

### **WCAG 2.1 AA Compliance**
- Color contrast ratios of 4.5:1 or higher
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Alternative text for images

### **Implementation**
- Semantic HTML elements
- ARIA labels and descriptions
- Focus management
- Reduced motion support
- High contrast mode support

## 🚀 **Performance**

### **Optimization**
- CSS custom properties for efficient theming
- GPU-accelerated animations
- Minimal bundle size
- Efficient selectors
- Reduced motion support

### **Best Practices**
- Use `transform` and `opacity` for animations
- Avoid animating layout properties
- Implement `will-change` sparingly
- Use `contain` for layout optimization
- Minimize repaints and reflows

## 📚 **Usage Examples**

### **Basic Button**
```tsx
<Button variant="primary" size="md">
  Click me
</Button>
```

### **Card with Gradient**
```tsx
<Card variant="gradient" padding="lg">
  <CardTitle>Space Mining Results</CardTitle>
  <CardContent>
    <p>Mined 1,250KB of digital space</p>
  </CardContent>
</Card>
```

### **Animated Counter**
```tsx
<AnimatedCounter
  value={1250}
  duration={1000}
  prefix="$"
  suffix="KB"
/>
```

### **Gradient Text**
```tsx
<GradientText gradient="rainbow" size="2xl">
  LightDom Platform
</GradientText>
```

## 🎨 **Customization**

### **Theme Override**
```css
:root {
  --color-primary: #your-color;
  --color-secondary: #your-color;
  /* Override other variables */
}
```

### **Component Variants**
```tsx
<Button 
  variant="custom" 
  className="bg-gradient-to-r from-purple-500 to-pink-500"
>
  Custom Button
</Button>
```

## 📖 **Resources**

### **Design Tools**
- Figma design system
- Storybook component library
- Design tokens documentation
- Accessibility testing tools

### **Development**
- TypeScript definitions
- Component documentation
- Usage examples
- Testing guidelines

---

This comprehensive style guide ensures consistency, accessibility, and modern design practices across the entire LightDom Space-Bridge platform. All components follow these guidelines to create a cohesive, user-friendly experience.