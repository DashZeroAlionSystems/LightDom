# Comprehensive Storybook Implementation Guide

## Executive Summary

This document provides complete guidance for implementing Storybook with Material Design 3, design tokens, component configurations, and advanced features for the LightDom project.

---

## Table of Contents

1. [Storybook Core Concepts](#storybook-core-concepts)
2. [Component Story Format (CSF)](#component-story-format)
3. [Controls & ArgTypes](#controls--argtypes)
4. [Decorators & Parameters](#decorators--parameters)
5. [Addons Ecosystem](#addons-ecosystem)
6. [Material Design 3 Integration](#material-design-3-integration)
7. [Design Token Implementation](#design-token-implementation)
8. [Config-Driven Components](#config-driven-components)
9. [Advanced Patterns](#advanced-patterns)
10. [Mining Strategies](#mining-strategies)

---

## 1. Storybook Core Concepts

### What is Storybook?

Storybook is an open-source tool for building UI components and pages in isolation. It streamlines UI development, testing, and documentation.

**Key Benefits:**

- **Isolated Development**: Build components outside your app
- **Visual Testing**: See every component state
- **Documentation**: Auto-generated component docs
- **Accessibility Testing**: Built-in a11y checks
- **Interaction Testing**: Test user workflows
- **Design Integration**: Connect Figma, Sketch, etc.

### Story Structure

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

// Meta defines component-level config
const meta: Meta<typeof Button> = {
  title: 'Atoms/Button', // Sidebar organization
  component: Button, // The component
  tags: ['autodocs'], // Auto-generate docs
  parameters: {
    // Addon configuration
    layout: 'centered',
  },
  argTypes: {
    // Control definitions
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Stories are named exports
export const Filled: Story = {
  args: {
    children: 'Button',
    variant: 'filled',
  },
};
```

---

## 2. Component Story Format (CSF)

### File Organization

```
src/components/atoms/Button/
├── Button.tsx           # Component implementation
├── Button.types.ts      # TypeScript interfaces
├── Button.stories.tsx   # Storybook stories
└── index.ts            # Re-exports
```

### Meta Configuration

```typescript
const meta: Meta<typeof Component> = {
  title: 'Category/Component',     // Sidebar path
  component: Component,             // Component to render

  // Organize stories
  tags: ['autodocs', '!dev'],       // Generate docs, hide from dev

  // Default arguments
  args: {
    defaultProp: 'value',
  },

  // ArgTypes define controls
  argTypes: {
    onClick: { action: 'clicked' }, // Log actions
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Button variant style',
    },
  },

  // Parameters configure addons
  parameters: {
    layout: 'centered',             // fullscreen, padded, centered
    backgrounds: {
      values: [
        { name: 'light', value: '#fff' },
        { name: 'dark', value: '#333' },
      ],
    },
  },

  // Decorators wrap stories
  decorators: [
    (Story) => (
      <div style={{ padding: '3rem' }}>
        <Story />
      </div>
    ),
  ],
};
```

### Story Types

**1. Basic Story**

```typescript
export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Button',
  },
};
```

**2. Story with Custom Rendering**

```typescript
export const WithWrapper: Story = {
  render: (args) => (
    <div className="custom-wrapper">
      <Button {...args} />
    </div>
  ),
  args: {
    label: 'Wrapped Button',
  },
};
```

**3. Composite Story (Multiple Components)**

```typescript
export const ButtonGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button variant="filled">Filled</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
    </div>
  ),
};
```

**4. Interactive Story with Play Function**

```typescript
export const WithInteraction: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(button).toHaveTextContent('Clicked');
  },
};
```

---

## 3. Controls & ArgTypes

### Control Types

| Type             | Data Type | UI Control           | Example                                                      |
| ---------------- | --------- | -------------------- | ------------------------------------------------------------ |
| **boolean**      | boolean   | Toggle switch        | `{ control: 'boolean' }`                                     |
| **number**       | number    | Number input         | `{ control: { type: 'number', min: 0, max: 100 } }`          |
| **range**        | number    | Slider               | `{ control: { type: 'range', min: 0, max: 100, step: 10 } }` |
| **text**         | string    | Text input           | `{ control: 'text' }`                                        |
| **color**        | string    | Color picker         | `{ control: { type: 'color', presetColors: ['#ff0000'] } }`  |
| **date**         | number    | Date picker          | `{ control: 'date' }`                                        |
| **select**       | enum      | Dropdown (single)    | `{ control: 'select', options: ['a', 'b'] }`                 |
| **multi-select** | array     | Dropdown (multiple)  | `{ control: 'multi-select', options: ['a', 'b'] }`           |
| **radio**        | enum      | Radio buttons        | `{ control: 'radio', options: ['a', 'b'] }`                  |
| **inline-radio** | enum      | Inline radio buttons | `{ control: 'inline-radio', options: ['a', 'b'] }`           |
| **check**        | array     | Checkboxes           | `{ control: 'check', options: ['a', 'b'] }`                  |
| **inline-check** | array     | Inline checkboxes    | `{ control: 'inline-check', options: ['a', 'b'] }`           |
| **object**       | object    | JSON editor          | `{ control: 'object' }`                                      |
| **file**         | File[]    | File upload          | `{ control: { type: 'file', accept: '.png' } }`              |

### Advanced ArgTypes

```typescript
argTypes: {
  // Conditional controls - only show if another arg is true
  advanced: { control: 'boolean' },
  margin: {
    control: 'number',
    if: { arg: 'advanced' } // Only show if advanced=true
  },

  // Complex value mapping
  icon: {
    options: Object.keys(icons),  // ['ArrowUp', 'ArrowDown']
    mapping: icons,               // { ArrowUp: <ArrowUp />, ... }
    control: {
      type: 'select',
      labels: {                   // Custom labels in dropdown
        ArrowUp: 'Up Arrow',
        ArrowDown: 'Down Arrow',
      },
    },
  },

  // Custom matchers - auto-detect controls
  backgroundColor: { control: 'color' }, // Matched by /(background|color)$/i
  createdAt: { control: 'date' },       // Matched by /Date$/

  // Disable controls for specific props
  internalProp: {
    table: { disable: true },  // Hide from docs table
  },
  children: {
    control: false,            // Show in docs, no control
  },
}
```

### Control Parameters

```typescript
parameters: {
  controls: {
    // Sort controls
    sort: 'requiredFirst',  // 'none' | 'alpha' | 'requiredFirst'

    // Filter controls
    include: ['variant', 'size'],  // Only show these
    exclude: ['internal.*'],       // Hide these

    // Expand docs
    expanded: true,  // Show full documentation for each arg

    // Preset colors for color picker
    presetColors: [
      { color: '#ff4785', title: 'Brand' },
      '#fe4a49',  // Just hex works too
    ],

    // Disable save from UI
    disableSaveFromUI: false,
  },
}
```

---

## 4. Decorators & Parameters

### Decorators

Decorators wrap stories in additional markup/logic. They execute in order from global → component → story.

**Global Decorator** (`.storybook/preview.tsx`):

```typescript
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/theme';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};
```

**Component Decorator**:

```typescript
const meta: Meta<typeof Button> = {
  component: Button,
  decorators: [
    (Story) => (
      <div style={{ margin: '3em' }}>
        <Story />
      </div>
    ),
  ],
};
```

**Story Decorator**:

```typescript
export const Responsive: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
};
```

**Context Decorator** (for mocking):

```typescript
import { AuthContext } from '../src/contexts/AuthContext';

const meta: Meta<typeof ProtectedComponent> = {
  decorators: [
    (Story, context) => (
      <AuthContext.Provider value={context.args.authContext}>
        <Story />
      </AuthContext.Provider>
    ),
  ],
  argTypes: {
    authContext: {
      control: 'object',
      defaultValue: { user: { name: 'John' }, isAuthenticated: true },
    },
  },
};
```

### Parameters

Parameters configure addon behavior.

**Common Parameters**:

```typescript
parameters: {
  // Layout
  layout: 'centered' | 'fullscreen' | 'padded',

  // Backgrounds addon
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#fff' },
      { name: 'dark', value: '#333' },
    ],
  },

  // Viewport addon
  viewport: {
    defaultViewport: 'iphone6',
  },

  // Actions addon
  actions: {
    argTypesRegex: '^on[A-Z].*', // Auto-log all props starting with 'on'
  },

  // Docs addon
  docs: {
    description: {
      story: 'This story demonstrates...',
    },
  },

  // Design addon
  design: {
    type: 'figma',
    url: 'https://figma.com/file/...',
  },

  // a11y addon
  a11y: {
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
      ],
    },
  },
}
```

---

## 5. Addons Ecosystem

### Essential Addons (Built-in)

1. **@storybook/addon-docs** - Auto-generate documentation
2. **@storybook/addon-controls** - Interactive component props
3. **@storybook/addon-actions** - Event handler logging
4. **@storybook/addon-viewport** - Responsive testing
5. **@storybook/addon-backgrounds** - Background color testing
6. **@storybook/addon-measure** - Measure dimensions
7. **@storybook/addon-outline** - Outline elements

### Popular Community Addons

```bash
npm install -D @storybook/addon-a11y              # Accessibility testing
npm install -D @storybook/addon-designs           # Figma/Sketch integration
npm install -D @storybook/addon-themes            # Theme switching
npm install -D storybook-dark-mode                # Dark mode toggle
npm install -D msw-storybook-addon                # Mock Service Worker
npm install -D @chromatic-com/storybook           # Visual regression testing
```

### Addon Configuration

**.storybook/main.ts**:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
    {
      name: '@storybook/addon-themes',
      options: {
        themes: {
          light: 'light-theme',
          dark: 'dark-theme',
        },
        defaultTheme: 'light',
      },
    },
  ],
};
```

**.storybook/preview.tsx**:

```typescript
import { withThemeByClassName } from '@storybook/addon-themes';

export const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light-theme',
      dark: 'dark-theme',
    },
    defaultTheme: 'light',
  }),
];
```

---

## 6. Material Design 3 Integration

### Design Token Structure

Material Design 3 uses a three-tier token system:

```
Reference Tokens (md.ref.*)
  ↓
System Tokens (md.sys.*)
  ↓
Component Tokens (md.comp.*)
```

**Example Token Flow**:

```
md.ref.palette.primary40     → #6750A4 (hex value)
  ↓
md.sys.color.primary          → md.ref.palette.primary40
  ↓
md.comp.button.filled.container.color → md.sys.color.primary
```

### Implementing MD3 Tokens in Components

**1. Create Token Mapping**:

```typescript
// src/design-tokens/md3-tokens.ts
export const md3Tokens = {
  ref: {
    palette: {
      primary10: '#21005D',
      primary20: '#381E72',
      primary30: '#4F378B',
      primary40: '#6750A4',
      primary80: '#D0BCFF',
      primary90: '#EADDFF',
      primary95: '#F6EDFF',
      primary99: '#FFFBFE',
    },
  },
  sys: {
    color: {
      primary: 'var(--md-sys-color-primary)',
      onPrimary: 'var(--md-sys-color-on-primary)',
      primaryContainer: 'var(--md-sys-color-primary-container)',
      onPrimaryContainer: 'var(--md-sys-color-on-primary-container)',
    },
    typography: {
      labelLarge: {
        font: 'var(--md-sys-typescale-label-large-font)',
        weight: 'var(--md-sys-typescale-label-large-weight)',
        size: 'var(--md-sys-typescale-label-large-size)',
        lineHeight: 'var(--md-sys-typescale-label-large-line-height)',
      },
    },
  },
};
```

**2. Generate CSS Variables**:

```css
/* styles/md3-tokens.css */
:root {
  /* Reference tokens */
  --md-ref-palette-primary40: #6750a4;
  --md-ref-palette-primary80: #d0bcff;

  /* System tokens - Light theme */
  --md-sys-color-primary: var(--md-ref-palette-primary40);
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: var(--md-ref-palette-primary90);
  --md-sys-color-on-primary-container: var(--md-ref-palette-primary10);
}

[data-theme='dark'] {
  /* System tokens - Dark theme */
  --md-sys-color-primary: var(--md-ref-palette-primary80);
  --md-sys-color-on-primary: var(--md-ref-palette-primary20);
  --md-sys-color-primary-container: var(--md-ref-palette-primary30);
  --md-sys-color-on-primary-container: var(--md-ref-palette-primary90);
}
```

**3. Component Token Usage**:

```typescript
// src/components/atoms/Button/Button.tsx
const buttonVariants = cva('button', {
  variants: {
    variant: {
      filled: [
        'bg-[var(--md-sys-color-primary)]',
        'text-[var(--md-sys-color-on-primary)]',
        'hover:shadow-[var(--md-sys-elevation-1)]',
      ],
      filledTonal: [
        'bg-[var(--md-sys-color-secondary-container)]',
        'text-[var(--md-sys-color-on-secondary-container)]',
      ],
      outlined: [
        'border border-[var(--md-sys-color-outline)]',
        'text-[var(--md-sys-color-primary)]',
      ],
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-6 text-base',
      lg: 'h-12 px-8 text-lg',
    },
  },
  defaultVariants: {
    variant: 'filled',
    size: 'md',
  },
});
```

**4. Storybook Integration**:

```typescript
// .storybook/preview.tsx
import '../src/styles/md3-tokens.css';

export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme || 'light';
    return (
      <div data-theme={theme}>
        <Story />
      </div>
    );
  },
];

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Material Design 3 theme',
    defaultValue: 'light',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
      dynamicTitle: true,
    },
  },
};
```

---

## 7. Design Token Implementation

### Token Schema Structure

```typescript
// src/design-tokens/schema.ts
export interface DesignTokenSchema {
  $type: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'cubicBezier';
  $value: string | number;
  $description?: string;
}

export interface TokenCollection {
  [key: string]: DesignTokenSchema | TokenCollection;
}

// Example:
const tokens: TokenCollection = {
  color: {
    brand: {
      primary: {
        $type: 'color',
        $value: '#6750A4',
        $description: 'Primary brand color',
      },
    },
  },
  spacing: {
    sm: {
      $type: 'dimension',
      $value: '8px',
    },
  },
};
```

### Token Resolution System

```typescript
// src/design-tokens/resolver.ts
export class TokenResolver {
  private tokens: TokenCollection;

  constructor(tokens: TokenCollection) {
    this.tokens = tokens;
  }

  resolve(path: string): string | number {
    const keys = path.split('.');
    let current: any = this.tokens;

    for (const key of keys) {
      current = current[key];
      if (!current) throw new Error(`Token not found: ${path}`);
    }

    // Handle token references like {color.brand.primary}
    if (typeof current.$value === 'string' && current.$value.startsWith('{')) {
      const refPath = current.$value.slice(1, -1);
      return this.resolve(refPath);
    }

    return current.$value;
  }

  toCSSVars(): Record<string, string> {
    const vars: Record<string, string> = {};

    const traverse = (obj: any, path: string[] = []) => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key];

        if (value && typeof value === 'object' && '$value' in value) {
          const varName = `--${currentPath.join('-')}`;
          vars[varName] = String(value.$value);
        } else if (value && typeof value === 'object') {
          traverse(value, currentPath);
        }
      }
    };

    traverse(this.tokens);
    return vars;
  }
}
```

### Token-Based Theming

```typescript
// src/theme/ThemeProvider.tsx
import { createContext, useContext } from 'react';
import { TokenResolver } from '../design-tokens/resolver';
import tokens from '../design-tokens/tokens.json';

const resolver = new TokenResolver(tokens);
const cssVars = resolver.toCSSVars();

export const ThemeContext = createContext<TokenResolver>(resolver);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={resolver}>
      <div style={cssVars as React.CSSProperties}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useToken = (path: string) => {
  const resolver = useContext(ThemeContext);
  return resolver.resolve(path);
};
```

---

## 8. Config-Driven Components

### Component Configuration Schema

```typescript
// src/component-generator/schema.ts
export interface ComponentConfig {
  name: string;
  category: 'atom' | 'molecule' | 'organism';
  description: string;

  props: PropConfig[];
  variants: VariantConfig[];
  states: StateConfig[];
  subComponents?: ComponentConfig[];

  designTokens: TokenMapping;
  accessibility: AccessibilityConfig;
  uxRules: UXRule[];
}

export interface PropConfig {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'object' | 'function';
  required: boolean;
  defaultValue?: any;
  description: string;
  enumValues?: string[];
  validation?: ValidationRule[];
}

export interface VariantConfig {
  name: string;
  props: Record<string, any>;
  className: string;
  tokens: Record<string, string>;
}

export interface StateConfig {
  name: 'default' | 'hover' | 'focus' | 'active' | 'disabled' | 'loading' | 'error';
  className: string;
  tokens: Record<string, string>;
}

export interface TokenMapping {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  spacing?: Record<string, string>;
  typography?: Record<string, string>;
}

export interface UXRule {
  id: string;
  name: string;
  severity: 'error' | 'warning' | 'info';
  category: 'accessibility' | 'interaction' | 'visual' | 'performance';
  description: string;
  validator: (props: any) => boolean;
}
```

### Example: Button Configuration

```json
{
  "name": "Button",
  "category": "atom",
  "description": "Material Design 3 button component with multiple variants",
  "props": [
    {
      "name": "variant",
      "type": "enum",
      "required": false,
      "defaultValue": "filled",
      "enumValues": ["filled", "filled-tonal", "outlined", "text", "elevated"],
      "description": "Visual variant of the button"
    },
    {
      "name": "size",
      "type": "enum",
      "required": false,
      "defaultValue": "md",
      "enumValues": ["sm", "md", "lg"],
      "description": "Size of the button"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "required": false,
      "defaultValue": false,
      "description": "Whether the button is disabled"
    },
    {
      "name": "loading",
      "type": "boolean",
      "required": false,
      "defaultValue": false,
      "description": "Whether the button is in loading state"
    }
  ],
  "variants": [
    {
      "name": "filled",
      "props": { "variant": "filled" },
      "className": "filled-button",
      "tokens": {
        "backgroundColor": "sys.color.primary",
        "textColor": "sys.color.onPrimary",
        "elevation": "sys.elevation.1"
      }
    },
    {
      "name": "outlined",
      "props": { "variant": "outlined" },
      "className": "outlined-button",
      "tokens": {
        "borderColor": "sys.color.outline",
        "textColor": "sys.color.primary"
      }
    }
  ],
  "states": [
    {
      "name": "hover",
      "className": "hover:shadow-md hover:brightness-110",
      "tokens": {
        "elevation": "sys.elevation.2"
      }
    },
    {
      "name": "disabled",
      "className": "opacity-38 cursor-not-allowed",
      "tokens": {
        "backgroundColor": "sys.color.onSurface",
        "textColor": "sys.color.onSurface"
      }
    }
  ],
  "designTokens": {
    "backgroundColor": "sys.color.primary",
    "textColor": "sys.color.onPrimary",
    "spacing": {
      "paddingX": "sys.spacing.4",
      "paddingY": "sys.spacing.2"
    },
    "typography": {
      "font": "sys.typescale.labelLarge.font",
      "weight": "sys.typescale.labelLarge.weight",
      "size": "sys.typescale.labelLarge.size"
    }
  },
  "accessibility": {
    "role": "button",
    "ariaLabel": true,
    "keyboardSupport": ["Enter", "Space"],
    "focusVisible": true
  },
  "uxRules": [
    {
      "id": "button-min-size",
      "name": "Minimum touch target size",
      "severity": "error",
      "category": "accessibility",
      "description": "Buttons must be at least 44x44px for touch targets",
      "validator": "(props) => props.size !== 'sm' || props.touchTarget >= 44"
    },
    {
      "id": "button-contrast",
      "name": "Color contrast ratio",
      "severity": "error",
      "category": "accessibility",
      "description": "Button text must have 4.5:1 contrast ratio",
      "validator": "(props) => checkContrast(props.backgroundColor, props.textColor) >= 4.5"
    }
  ]
}
```

### Component Generator

```typescript
// src/component-generator/generator.ts
export class ComponentGenerator {
  constructor(
    private config: ComponentConfig,
    private resolver: TokenResolver
  ) {}

  generateComponent(): string {
    return `
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ${this.config.name}Props } from './${this.config.name}.types';

const ${this.config.name.toLowerCase()}Variants = cva('${this.config.name.toLowerCase()}', {
  variants: {
    ${this.generateVariants()}
  },
  defaultVariants: {
    ${this.generateDefaultVariants()}
  },
});

export const ${this.config.name}: React.FC<${this.config.name}Props> = ({
  ${this.generatePropDestructuring()}
}) => {
  ${this.generateValidation()}
  
  return (
    <button
      className={${this.config.name.toLowerCase()}Variants({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};
`;
  }

  generateTypes(): string {
    return `
export interface ${this.config.name}Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ${this.config.props.map(p => `${p.name}${p.required ? '' : '?'}: ${p.type};`).join('\n  ')}
}
`;
  }

  generateStories(): string {
    return `
import type { Meta, StoryObj } from '@storybook/react';
import { ${this.config.name} } from './${this.config.name}';

const meta: Meta<typeof ${this.config.name}> = {
  title: '${this.config.category}/${this.config.name}',
  component: ${this.config.name},
  tags: ['autodocs'],
  argTypes: {
    ${this.generateArgTypes()}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

${this.generateStoriesFromVariants()}
`;
  }
}
```

---

## 9. Advanced Patterns

### Pattern 1: Component Composition Stories

```typescript
// Showcase component used in different contexts
export const InCard: Story = {
  render: (args) => (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button {...args} />
      </CardContent>
    </Card>
  ),
};
```

### Pattern 2: Responsive Stories

```typescript
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'iphone6',
    },
  },
};

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'ipad',
    },
  },
};
```

### Pattern 3: State Machine Stories

```typescript
export const LoadingToSuccess: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Initial state
    await expect(button).toHaveTextContent('Submit');

    // Click to start loading
    await userEvent.click(button);
    await expect(button).toHaveAttribute('disabled');
    await expect(button).toHaveTextContent('Loading...');

    // Wait for success
    await waitFor(() => {
      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveTextContent('Success!');
    });
  },
};
```

### Pattern 4: Theme Variations

```typescript
export const AllThemes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {['light', 'dark', 'high-contrast'].map(theme => (
        <div key={theme} data-theme={theme} style={{ padding: '2rem', border: '1px solid' }}>
          <h3>{theme}</h3>
          <Button {...args} />
        </div>
      ))}
    </div>
  ),
};
```

---

## 10. Mining Strategies

### 1. Scraping Storybook Instances

**Target Sites**:

- VS Code UI Toolkit: https://microsoft.github.io/vscode-webview-ui-toolkit/
- GitLab UI: https://gitlab-org.gitlab.io/gitlab-ui/
- Material UI: https://mui.com/material-ui/
- Ant Design: https://ant.design/components/
- Chakra UI: https://chakra-ui.com/docs/components

**Data to Extract**:

```typescript
interface StorybookData {
  components: {
    name: string;
    category: string;
    variants: Array<{
      name: string;
      props: Record<string, any>;
    }>;
    argTypes: Record<string, ArgTypeConfig>;
    design Tokens: Record<string, string>;
    accessibility: AccessibilityInfo;
  }[];
}
```

**Scraping Script**:

```typescript
// scripts/mine-storybook.ts
import puppeteer from 'puppeteer';

async function mineStorybook(url: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url);

  // Extract story data from Storybook API
  const data = await page.evaluate(() => {
    // @ts-ignore
    const stories = window.__STORYBOOK_PREVIEW__?.storyStore?.raw();
    return stories;
  });

  // Extract computed styles
  const styles = await page.evaluate(() => {
    const component = document.querySelector('[data-test-id="component"]');
    return window.getComputedStyle(component);
  });

  await browser.close();
  return { data, styles };
}
```

### 2. Design Token Mining

**Extract CSS Variables**:

```typescript
async function extractDesignTokens(url: string) {
  const page = await puppeteer.newPage();
  await page.goto(url);

  const tokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const cssVars: Record<string, string> = {};

    // Get all CSS variables
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith('--')) {
        cssVars[prop] = styles.getPropertyValue(prop).trim();
      }
    }

    return cssVars;
  });

  return tokens;
}
```

### 3. Component Schema Mining

**Extract Component Metadata**:

```typescript
async function mineComponentSchema(componentUrl: string) {
  const page = await puppeteer.newPage();
  await page.goto(componentUrl);

  const schema = await page.evaluate(() => {
    // Extract from docs page
    const props = Array.from(document.querySelectorAll('[data-props-table] tr')).map(row => ({
      name: row.querySelector('[data-prop-name]')?.textContent,
      type: row.querySelector('[data-prop-type]')?.textContent,
      default: row.querySelector('[data-prop-default]')?.textContent,
      description: row.querySelector('[data-prop-description]')?.textContent,
    }));

    return { props };
  });

  return schema;
}
```

### 4. UX Rules Extraction

**Mine Accessibility Rules**:

```typescript
async function extractUXRules(url: string) {
  const page = await puppeteer.newPage();
  await page.goto(url);

  // Run axe-core
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js',
  });

  const a11yResults = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run();
  });

  // Extract rules
  const rules = a11yResults.violations.map(violation => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    helpUrl: violation.helpUrl,
  }));

  return rules;
}
```

### 5. Training Data Collection

**Structure for Neural Network**:

```typescript
interface TrainingData {
  input: {
    componentType: string;
    context: string;
    requirements: string[];
    constraints: Record<string, any>;
  };
  output: {
    variant: string;
    props: Record<string, any>;
    tokens: Record<string, string>;
    accessibility: AccessibilityConfig;
  };
  metadata: {
    source: string;
    confidence: number;
    uxScore: number;
  };
}
```

**Collect Training Samples**:

```typescript
async function collectTrainingSamples(urls: string[]) {
  const samples: TrainingData[] = [];

  for (const url of urls) {
    const data = await mineStorybook(url);
    const tokens = await extractDesignTokens(url);
    const rules = await extractUXRules(url);

    // Transform into training format
    samples.push({
      input: {
        componentType: data.component.name,
        context: data.component.category,
        requirements: data.component.features,
        constraints: data.component.limits,
      },
      output: {
        variant: data.component.variant,
        props: data.component.props,
        tokens: tokens,
        accessibility: rules,
      },
      metadata: {
        source: url,
        confidence: calculateConfidence(data),
        uxScore: calculateUXScore(rules),
      },
    });
  }

  return samples;
}
```

---

## Implementation Checklist

- [ ] Fix Storybook dynamic import errors
- [ ] Add streaming RAG chat endpoints
- [ ] Create MD3 token mapping system
- [ ] Implement config-driven component generator
- [ ] Build Storybook mining automation
- [ ] Setup design token extraction pipeline
- [ ] Create UX rules validation engine
- [ ] Collect training data for neural network
- [ ] Implement TensorFlow model for component generation
- [ ] Build DevTools scraper for live design systems
- [ ] Create design system integration layer
- [ ] Implement component auto-generator from schemas

---

## References

- **Storybook Docs**: https://storybook.js.org/docs
- **Material Design 3**: https://m3.material.io/
- **Design Tokens**: https://m3.material.io/foundations/design-tokens/overview
- **VS Code UI Toolkit**: https://microsoft.github.io/vscode-webview-ui-toolkit/
- **GitLab UI**: https://gitlab-org.gitlab.io/gitlab-ui/
- **Storybook Addons**: https://storybook.js.org/addons
