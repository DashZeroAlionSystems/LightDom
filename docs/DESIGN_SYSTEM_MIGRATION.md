# Design System Migration Guide

## Overview

This guide helps migrate from the old fragmented design systems to the new **Unified Design System**.

## Problem Statement

The LightDom project currently has **10+ different design system files**, causing:
- ❌ Inconsistent styling across pages
- ❌ Duplicate code and token definitions
- ❌ Confusion about which system to use
- ❌ Maintenance overhead
- ❌ Large bundle size

## Solution

Use **ONE** design system: `src/styles/UnifiedDesignSystem.tsx`

## Migration Steps

### Step 1: Update Imports

#### Old (Don't use these anymore):
```typescript
// ❌ DEPRECATED - Multiple design systems
import { LightDomDesignSystem } from '../../styles/LightDomDesignSystem';
import { Colors, Typography } from '../../styles/EnhancedDesignSystem';
import { useTheme } from '../../utils/ReusableDesignSystem';
import { StatusCard } from '../DesignSystemComponents';
```

#### New (Use this):
```typescript
// ✅ UNIFIED DESIGN SYSTEM - Use everywhere
import UnifiedDesignSystem, {
  Colors,
  Typography,
  Spacing,
  Shadows,
  ComponentStyles,
  cn,
  TailwindPresets,
} from '../../styles/UnifiedDesignSystem';
```

### Step 2: Update Color Usage

#### Old:
```typescript
// Using inline hex codes
<div style={{ backgroundColor: '#7c3aed', color: '#ffffff' }}>

// Using different color systems
<div style={{ backgroundColor: LightDomDesignSystem.colors.primary }}>
<div style={{ backgroundColor: Colors.primary[600] }}>
```

#### New:
```typescript
// Using Unified Design System
import { Colors } from '../../styles/UnifiedDesignSystem';

<div style={{ backgroundColor: Colors.primary[600], color: Colors.dark.onPrimary }}>

// Or with Tailwind classes
<div className="bg-purple-600 text-white">
```

### Step 3: Update Typography

#### Old:
```typescript
<h1 style={{ fontSize: '32px', fontWeight: 700 }}>
<p style={{ fontSize: '16px', lineHeight: '24px' }}>
```

#### New:
```typescript
import { Typography } from '../../styles/UnifiedDesignSystem';

<h1 style={Typography.headline.large}>Title</h1>
<p style={Typography.body.large}>Content</p>

// Or with Tailwind
<h1 className={TailwindPresets.text.heading}>Title</h1>
<p className={TailwindPresets.text.body}>Content</p>
```

### Step 4: Update Spacing

#### Old:
```typescript
<div style={{ padding: '16px', margin: '24px' }}>
<div style={{ gap: '8px' }}>
```

#### New:
```typescript
import { Spacing } from '../../styles/UnifiedDesignSystem';

<div style={{ padding: Spacing[4], margin: Spacing[6] }}>
<div style={{ gap: Spacing[2] }}>

// Or with Tailwind
<div className="p-4 m-6">
<div className="gap-2">
```

### Step 5: Update Component Styles

#### Old (Manual styles):
```typescript
<button
  style={{
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  }}
>
  Click Me
</button>
```

#### New (Using presets):
```typescript
import { ComponentStyles } from '../../styles/UnifiedDesignSystem';

// Option 1: Use style preset
<button style={ComponentStyles.button.filled}>
  Click Me
</button>

// Option 2: Use Tailwind preset
<button className={TailwindPresets.button.primary}>
  Click Me
</button>

// Option 3: Combine both
<button 
  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
>
  Click Me
</button>
```

### Step 6: Update Cards

#### Old:
```typescript
<div
  style={{
    backgroundColor: '#171717',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
  }}
>
```

#### New:
```typescript
import { ComponentStyles } from '../../styles/UnifiedDesignSystem';

// Option 1: Use style preset
<div style={ComponentStyles.card.elevated}>
  Card content
</div>

// Option 2: Use Tailwind preset
<div className={TailwindPresets.card.default}>
  Card content
</div>

// Option 3: Glass morphism
<div className={TailwindPresets.card.glass}>
  Glass card content
</div>
```

## Component Pattern Examples

### Button Component

```typescript
import React from 'react';
import { ComponentStyles, cn } from '../../styles/UnifiedDesignSystem';

interface ButtonProps {
  variant?: 'filled' | 'outlined' | 'text';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  children,
  onClick,
  className,
}) => {
  const baseStyle = ComponentStyles.button[variant];
  
  return (
    <button
      style={baseStyle}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### Card Component

```typescript
import React from 'react';
import { ComponentStyles } from '../../styles/UnifiedDesignSystem';

interface CardProps {
  variant?: 'elevated' | 'filled' | 'outlined' | 'glass';
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  children,
  className,
}) => {
  const baseStyle = ComponentStyles.card[variant];
  
  return (
    <div style={baseStyle} className={className}>
      {children}
    </div>
  );
};
```

### Input Component

```typescript
import React from 'react';
import { ComponentStyles } from '../../styles/UnifiedDesignSystem';

interface InputProps {
  variant?: 'outlined' | 'filled';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  variant = 'outlined',
  placeholder,
  value,
  onChange,
  className,
}) => {
  const baseStyle = ComponentStyles.input[variant];
  
  return (
    <input
      style={baseStyle}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};
```

## Page Migration Example

### Before (LoginPage.tsx):

```typescript
const LoginPage = () => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
    }}>
      <div style={{
        backgroundColor: '#171717',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>
          Login
        </h1>
        <input
          type="email"
          placeholder="Email"
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#262626',
            border: '1px solid #404040',
            color: '#ffffff',
          }}
        />
        <button
          style={{
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
```

### After (Using Unified Design System):

```typescript
import {
  Colors,
  Typography,
  ComponentStyles,
  TailwindPresets,
} from '../../styles/UnifiedDesignSystem';

const LoginPage = () => {
  return (
    <div 
      className={TailwindPresets.flex.center}
      style={{ 
        minHeight: '100vh',
        backgroundColor: Colors.dark.background,
      }}
    >
      <div style={ComponentStyles.card.elevated}>
        <h1 style={Typography.headline.large}>
          Login
        </h1>
        <input
          type="email"
          placeholder="Email"
          style={ComponentStyles.input.outlined}
        />
        <button style={ComponentStyles.button.filled}>
          Sign In
        </button>
      </div>
    </div>
  );
};
```

### After (Using Pure Tailwind - Recommended):

```typescript
const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Login
        </h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all mb-4"
        />
        <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
          Sign In
        </button>
      </div>
    </div>
  );
};
```

## Best Practices

### 1. Prefer Tailwind Classes

Tailwind classes are more maintainable and result in smaller bundles:

```typescript
// ✅ GOOD - Uses Tailwind (recommended)
<div className="bg-gray-900 p-6 rounded-lg shadow-lg">

// ⚠️ OK - Uses design system styles
<div style={ComponentStyles.card.elevated}>

// ❌ AVOID - Inline styles
<div style={{ backgroundColor: '#171717', padding: '24px', borderRadius: '16px' }}>
```

### 2. Use Semantic Color Names

```typescript
// ✅ GOOD
<div style={{ backgroundColor: Colors.dark.surface }}>
<div className="bg-gray-900">

// ❌ AVOID
<div style={{ backgroundColor: '#171717' }}>
```

### 3. Use Spacing System

```typescript
// ✅ GOOD
<div style={{ padding: Spacing[6] }}>
<div className="p-6">

// ❌ AVOID
<div style={{ padding: '24px' }}>
```

### 4. Use Typography Scale

```typescript
// ✅ GOOD
<h1 style={Typography.headline.large}>
<h1 className="text-3xl font-bold">

// ❌ AVOID
<h1 style={{ fontSize: '32px', fontWeight: 700 }}>
```

## Common Patterns

### Responsive Container

```typescript
<div className={TailwindPresets.container.centered}>
  <div className={TailwindPresets.container.section}>
    Content
  </div>
</div>
```

### Flex Layouts

```typescript
// Centered
<div className={TailwindPresets.flex.center}>

// Space between
<div className={TailwindPresets.flex.between}>

// Column centered
<div className={TailwindPresets.flex.colCenter}>
```

### Grid Layouts

```typescript
// Responsive auto grid
<div className={TailwindPresets.grid.auto}>
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</div>

// Custom grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Cards with Hover Effects

```typescript
<div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl hover:border-purple-600 transition-all duration-200">
  Card content
</div>
```

### Buttons with Icons

```typescript
import { Plus } from 'lucide-react';

<button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all">
  <Plus size={20} />
  Add Item
</button>
```

## Files to Update (Priority Order)

### High Priority (Core User Flows)
1. ✅ `src/pages/auth/LoginPage.tsx` 
2. [ ] `src/pages/auth/RegisterPage.tsx`
3. [ ] `src/pages/LandingPage.tsx`
4. [ ] `src/components/admin/AdminDashboard.tsx`
5. [ ] `src/components/ui/ClientZone.tsx`

### Medium Priority (Feature Pages)
6. [ ] `src/components/pages/MiningDashboard.tsx`
7. [ ] `src/components/pages/BlockchainDashboard.tsx`
8. [ ] `src/components/pages/SEOOptimizationDashboard.tsx`
9. [ ] `src/components/pages/MetaverseDashboard.tsx`
10. [ ] `src/components/pages/WalletDashboard.tsx`

### Low Priority (Specialized Features)
11. [ ] All remaining component files

## Deprecated Files (To Remove)

After migration is complete, these files can be removed:

- `src/styles/DesignSystem.tsx`
- `src/styles/EnhancedDesignSystem.tsx`
- `src/styles/LightDomDesignSystem.tsx`
- `src/styles/MaterialDesignSystem.tsx`
- `src/styles/NewDesignSystem.tsx`
- `src/utils/ReusableDesignSystem.tsx`
- `src/components/DesignSystemComponents.tsx`
- `src/components/EnhancedDesignSystem.tsx`
- `src/components/ui/DesignSystem.tsx`

## Testing Checklist

After migrating a component:

- [ ] Component renders without errors
- [ ] Colors match design system
- [ ] Typography follows scale
- [ ] Spacing is consistent
- [ ] Hover states work
- [ ] Responsive breakpoints work
- [ ] Dark/light theme works (if applicable)
- [ ] Animations are smooth
- [ ] No console warnings/errors

## Questions?

If you have questions about the migration, check:
1. `docs/research/ui-ux-patterns.md` - UI/UX best practices
2. `docs/research/design-system-rules.md` - Design system usage rules
3. `src/styles/UnifiedDesignSystem.tsx` - Full design token reference

## Summary

**Before**: 10+ design systems, inconsistent styles, duplicate code  
**After**: 1 unified design system, consistent styles, maintainable code

**Goal**: All components using either:
- Tailwind classes (preferred)
- Unified Design System tokens (when needed)
- No inline hex codes or magic numbers
