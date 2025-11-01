# LightDom Design System Research Documentation

This directory contains comprehensive research and guidelines for the LightDom design system implementation, based on Material Design 3, Tailwind CSS, and modern UI/UX patterns.

## 🎯 Latest Research (2025-10-28)

### **New Comprehensive Guides**

1. **[UI/UX Patterns Research](./UI_UX_PATTERNS_RESEARCH.md)** ⭐ NEW
   - Complete atomic design methodology guide
   - SOLID principles for component development
   - Reusable component patterns and APIs
   - Material Design 3 integration
   - Tailwind CSS best practices
   - Accessibility standards (WCAG 2.1 Level AA)
   - Design tokens system
   - Animation and motion guidelines
   - Component library structure

2. **[Material Design 3 Complete Guide](./MATERIAL_DESIGN_3_GUIDE.md)** ⭐ NEW
   - Full Material Design 3 (Material You) specification
   - Complete color system with 13-tone palettes
   - Typography scale (display, headline, title, body, label)
   - Shape system and border radius tokens
   - Elevation and shadow system (5 levels)
   - Motion and animation system
   - State layers and interactive feedback
   - Component specifications with code examples
   - CSS custom properties setup
   - Implementation examples for buttons, cards, inputs

3. **[Tailwind Integration Guide](./TAILWIND_INTEGRATION_GUIDE.md)** ⭐ NEW
   - Complete Tailwind configuration for Material Design 3
   - Custom color palette setup
   - Typography and spacing tokens
   - Component utility classes
   - Responsive design patterns
   - Dark mode implementation
   - Animation utilities
   - Performance optimization
   - Usage examples for all component types

4. **[Design System Rules](./DESIGN_SYSTEM_RULES.md)** ⭐ NEW
   - Comprehensive coding rules and guidelines
   - Design principles (Consistency, Material Design 3, Accessibility, Mobile-First)
   - Component development rules
   - Color, typography, spacing, animation rules
   - Button, card, form, data visualization rules
   - Dashboard and navigation patterns
   - Performance optimization rules
   - Testing and documentation requirements
   - Anti-patterns to avoid
   - Code quality checklist

### Legacy Research Documents

5. **[UI/UX Component Patterns](./ui-ux-component-patterns.md)** (Legacy)
   - Component architecture patterns (compound, polymorphic, render props, slots)
   - State management patterns (reducers, custom hooks)
   - Styling patterns with CVA and Tailwind
   - Performance optimization techniques
   - Accessibility patterns and best practices
   - Testing strategies for components

6. **[Material Design 3 Guidelines](./material-design-3-guidelines.md)** (Legacy)
   - Material Design 3 (Material You) core principles
   - Dynamic color system and tonal palettes
   - Typography scale specifications
   - Elevation and surface tinting system
   - Component specifications (buttons, cards, inputs, FABs, chips)
   - Motion and animation system
   - Accessibility requirements

7. **[Tailwind CSS Best Practices](./tailwind-best-practices.md)** (Legacy)
   - Utility-first methodology and benefits
   - Theme configuration and design tokens
   - Component patterns with CVA (Class Variance Authority)
   - Responsive design and dark mode
   - Performance optimization
   - Integration with existing design systems

8. **[Design System Research Summary](./design-system-research-summary.md)** (Legacy)
   - Consolidated design system principles
   - Implementation roadmap (10-week plan)
   - Component checklist and requirements
   - Naming conventions and testing strategy
   - Tools and libraries recommendations


---

## 🚀 Quick Start Guide

### For Developers

1. **Start Here**: [Design System Rules](./DESIGN_SYSTEM_RULES.md) - Quick reference and best practices
2. **Deep Dive**: [UI/UX Patterns Research](./UI_UX_PATTERNS_RESEARCH.md) - Comprehensive component patterns
3. **Material Design**: [Material Design 3 Guide](./MATERIAL_DESIGN_3_GUIDE.md) - Complete MD3 specifications
4. **Tailwind Setup**: [Tailwind Integration Guide](./TAILWIND_INTEGRATION_GUIDE.md) - Implementation guide

### For Designers

1. **Color System**: [Material Design 3 Guide - Color System](./MATERIAL_DESIGN_3_GUIDE.md#color-system-deep-dive)
2. **Typography**: [Material Design 3 Guide - Typography](./MATERIAL_DESIGN_3_GUIDE.md#typography-system)
3. **Components**: [Material Design 3 Guide - Component Specifications](./MATERIAL_DESIGN_3_GUIDE.md#component-specifications)
4. **Motion**: [UI/UX Patterns - Animation & Motion](./UI_UX_PATTERNS_RESEARCH.md#animation--motion)

### Quick Reference Tables

#### Material Design 3 Color Tones
```
0 → 100: Pure black to pure white (13 tones)
Tones: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100
Default: 40 (light theme), 80 (dark theme)
```

#### Typography Scale
```
Display:  57px, 45px, 36px  (Hero text, large headings)
Headline: 32px, 28px, 24px  (Section headings)
Title:    22px, 16px, 14px  (Card titles, list headers)
Body:     16px, 14px, 12px  (Main content)
Label:    14px, 12px, 11px  (Buttons, tabs, labels)
```

#### Spacing (8px Grid)
```
1 = 4px,   2 = 8px,   3 = 12px,  4 = 16px ← Most common
5 = 20px,  6 = 24px,  7 = 28px,  8 = 32px ← Sections
10 = 40px, 12 = 48px, 16 = 64px ← Major sections
```

#### Animation Duration
```
Short:  50-200ms   (Icons, simple transitions)
Medium: 250-400ms  (Lists, panels, expanding)
Long:   450-600ms  (Page transitions, complex)
```

---

## 📚 Documentation Structure

### Implementation Guide

See [Design System Implementation Guide](../DESIGN_SYSTEM_IMPLEMENTATION.md) for practical examples and code snippets.

Also updated in `.cursorrules` file with new research-based guidelines.

### Key Design Principles

1. **Consistency First**
   - Use design tokens throughout
   - Never hardcode values
   - Reference design system for all decisions

2. **Material Design 3 Foundation**
   - 13-tone color palettes
   - Proper elevation with shadows
   - State layers for interactions
   - Material motion system

3. **Accessibility Always**
   - WCAG 2.1 Level AA compliance mandatory
   - Minimum contrast ratios (4.5:1 normal text, 3:1 large text)
   - Keyboard navigation support
   - ARIA attributes
   - Screen reader compatibility

4. **Mobile-First Responsive**
   - Design for mobile, enhance for desktop
   - Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
   - Touch targets minimum 44x44px

### Component Architecture

```
components/
├── atoms/          (Basic building blocks: Button, Input, Icon, Badge)
├── molecules/      (Simple groups: FormField, SearchBar, Card)
├── organisms/      (Complex: Navigation, DataTable, Modal)
├── templates/      (Page layouts: DashboardLayout, AuthLayout)
└── pages/          (Full pages: Dashboard, Settings)
```

Each component must have:
- ✅ TypeScript implementation
- ✅ Unit tests (.test.tsx)
- ✅ Storybook story (.stories.tsx)
- ✅ JSDoc documentation
- ✅ Accessibility support
- ✅ Light/dark theme support
- ✅ Responsive design

---

## 🎯 Component Development Workflow

1. **Design First**: Create Storybook story with all variants
2. **Implement**: Build component following Material Design 3 specs
3. **Test**: Write unit tests and accessibility tests
4. **Document**: Add JSDoc comments and usage examples
5. **Review**: Check against design system rules
6. **Deploy**: Merge to main after passing all checks

---

## General Research Notes

This folder also contains research notes and CI-created artifacts related to ML, automation, AI agents, and prompt engineering. Keep each file focused on a single topic and follow `docs/RESEARCH_GUIDE.md` for the preferred format.

### CI-Generated Files
- `diagnostics/research/` is used to store raw outputs created by the automated research workflow.

### Naming Conventions
- Use `YYYYMMDD-<topic>-<author>.md` for manual notes.
- CI artifacts use `ci-<runid>-<topic>.md`.
- Design system docs use descriptive kebab-case names.

## Quick Links

### For Developers
- [Component Patterns](./ui-ux-component-patterns.md#component-architecture-patterns)
- [CVA Usage](./tailwind-best-practices.md#1-class-variance-authority-cva)
- [Implementation Examples](../DESIGN_SYSTEM_IMPLEMENTATION.md)

### For Designers
- [Color System](./material-design-3-guidelines.md#color-system)
- [Typography](./material-design-3-guidelines.md#typography)
- [Elevation](./material-design-3-guidelines.md#elevation)
- [Motion](./material-design-3-guidelines.md#motion--animation)

### Configuration
- [Tailwind Config](../../tailwind.config.js) - Updated with M3 tokens
- [Coding Rules](../../.cursorrules) - Design system standards

## Resources

- [Material Design 3](https://m3.material.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Last Updated**: 2025-10-28
