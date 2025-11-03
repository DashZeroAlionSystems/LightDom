# Design System Interpreter - Schema-Driven Component Compilation

## Overview

The Design System Interpreter is a schema-driven system that compiles error-free React components from configuration schemas while strictly adhering to a design system style guide. It acts as a bridge between semantic component definitions (schemas) and production-ready UI implementations.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Architecture](#architecture)
3. [Schema Format](#schema-format)
4. [Design Token Resolution](#design-token-resolution)
5. [Component Compilation Pipeline](#component-compilation-pipeline)
6. [Style Guide Matching](#style-guide-matching)
7. [Implementation](#implementation)
8. [Usage Examples](#usage-examples)
9. [Integration with LightDom](#integration-with-lightdom)
10. [Best Practices](#best-practices)

---

## Core Concepts

### What is a Design System Interpreter?

A Design System Interpreter translates abstract component schemas into concrete implementations that:

- ✅ **Match the design system** (Ant Design, Material-UI, custom)
- ✅ **Follow the style guide** (colors, spacing, typography)
- ✅ **Compile error-free** (TypeScript strict mode)
- ✅ **Are accessible** (ARIA attributes, keyboard navigation)
- ✅ **Are performant** (optimized rendering, memoization)
- ✅ **Are testable** (generated tests, Storybook stories)

### Key Principles

1. **Single Source of Truth**: Schema defines component structure and behavior
2. **Design Token Resolution**: Automatic mapping from semantic tokens to concrete values
3. **Style Guide Enforcement**: Components automatically match the style guide
4. **Type Safety**: Full TypeScript support with generated types
5. **Zero Configuration**: Works out of the box with sensible defaults

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Component Schema                         │
│  {                                                           │
│    "@type": "Button",                                        │
│    "variant": "primary",                                     │
│    "lightdom:styling": { "backgroundColor": "primary" }      │
│  }                                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Design System Interpreter                       │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Schema Parser  │→ │ Token Resolver │→ │ Code Generator│ │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│          │                   │                    │         │
│          ▼                   ▼                    ▼         │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Validator      │  │ Style Matcher  │  │ Type Generator│ │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  Generated Output                            │
│                                                              │
│  • Component.tsx (React component)                           │
│  • Component.types.ts (TypeScript types)                     │
│  • Component.test.tsx (Jest tests)                           │
│  • Component.stories.tsx (Storybook)                         │
│  • Component.css (Styles)                                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Input**: Component schema (JSON-LD format)
2. **Parse**: Extract component type, props, styling
3. **Resolve**: Map design tokens to concrete values
4. **Match**: Find corresponding design system component
5. **Generate**: Create TypeScript/React code
6. **Validate**: Check for errors, accessibility
7. **Output**: Production-ready component files

---

## Schema Format

### LightDom Component Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Button",
  "@id": "lightdom:button:primary",
  "name": "PrimaryButton",
  "description": "A primary action button",
  
  "lightdom:componentType": "atom",
  "lightdom:framework": "react",
  
  "lightdom:props": [
    {
      "name": "onClick",
      "type": "function",
      "required": false,
      "description": "Click event handler"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": false
    },
    {
      "name": "children",
      "type": "ReactNode",
      "required": true
    }
  ],
  
  "lightdom:styling": {
    "backgroundColor": "primary",
    "color": "white",
    "padding": "md",
    "borderRadius": "md",
    "fontSize": "md",
    "fontWeight": "semibold",
    "transition": "all 0.2s",
    "hover": {
      "backgroundColor": "primary-dark",
      "transform": "translateY(-2px)",
      "boxShadow": "md"
    },
    "disabled": {
      "opacity": 0.5,
      "cursor": "not-allowed"
    }
  },
  
  "lightdom:accessibility": {
    "role": "button",
    "ariaLabel": "Primary action button",
    "keyboardNavigable": true,
    "focusVisible": true
  },
  
  "lightdom:variants": [
    {
      "name": "primary",
      "styling": {
        "backgroundColor": "primary",
        "color": "white"
      }
    },
    {
      "name": "secondary",
      "styling": {
        "backgroundColor": "secondary",
        "color": "white"
      }
    },
    {
      "name": "ghost",
      "styling": {
        "backgroundColor": "transparent",
        "color": "primary",
        "border": "1px solid primary"
      }
    }
  ],
  
  "lightdom:states": {
    "default": {},
    "hover": {},
    "active": {},
    "focus": {},
    "disabled": {}
  }
}
```

---

## Design Token Resolution

### Design Token System

Design tokens are semantic variables that map to concrete values:

```typescript
interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  borders: BorderTokens;
  animations: AnimationTokens;
}
```

### Color Tokens

```typescript
const colorTokens = {
  // Primary colors
  primary: '#1677ff',
  'primary-dark': '#0958d9',
  'primary-light': '#4096ff',
  
  // Semantic colors
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1677ff',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e8e8e8',
    300: '#d9d9d9',
    400: '#bfbfbf',
    500: '#8c8c8c',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#1f1f1f'
  },
  
  // Discord theme (custom)
  discord: {
    blurple: '#5865F2',
    green: '#57F287',
    yellow: '#FEE75C',
    fuchsia: '#EB459E',
    red: '#ED4245',
    white: '#FFFFFF',
    black: '#23272A'
  }
};
```

### Spacing Tokens

```typescript
const spacingTokens = {
  xs: '4px',   // 0.25rem
  sm: '8px',   // 0.5rem
  md: '16px',  // 1rem
  lg: '24px',  // 1.5rem
  xl: '32px',  // 2rem
  '2xl': '48px', // 3rem
  '3xl': '64px', // 4rem
  '4xl': '96px'  // 6rem
};
```

### Typography Tokens

```typescript
const typographyTokens = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'Fira Code, Consolas, Monaco, monospace'
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px'
  },
  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  }
};
```

### Shadow Tokens

```typescript
const shadowTokens = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};
```

### Border Tokens

```typescript
const borderTokens = {
  radius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '8px',
    xl: '12px',
    full: '9999px'
  },
  width: {
    none: '0',
    thin: '1px',
    md: '2px',
    thick: '4px'
  }
};
```

### Animation Tokens

```typescript
const animationTokens = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};
```

### Token Resolution Algorithm

```typescript
function resolveToken(token: string, type: TokenType): string {
  // 1. Check if token is already a concrete value
  if (isConcreteValue(token)) {
    return token;
  }
  
  // 2. Look up token in design system
  const resolved = designTokens[type][token];
  
  // 3. Handle nested tokens (e.g., "gray.500")
  if (token.includes('.')) {
    const parts = token.split('.');
    return resolvePath(designTokens[type], parts);
  }
  
  // 4. Fall back to default if not found
  if (!resolved) {
    console.warn(`Token not found: ${type}.${token}`);
    return getDefault(type);
  }
  
  return resolved;
}
```

---

## Component Compilation Pipeline

### 1. Schema Parsing

```typescript
interface ParsedSchema {
  type: string;
  name: string;
  props: PropDefinition[];
  styling: StylingConfig;
  accessibility: AccessibilityConfig;
  variants: VariantDefinition[];
  states: StateDefinition[];
}

function parseSchema(schema: ComponentSchema): ParsedSchema {
  return {
    type: schema['@type'],
    name: schema.name,
    props: schema['lightdom:props'],
    styling: schema['lightdom:styling'],
    accessibility: schema['lightdom:accessibility'],
    variants: schema['lightdom:variants'] || [],
    states: schema['lightdom:states'] || {}
  };
}
```

### 2. Design Token Resolution

```typescript
function resolveDesignTokens(styling: StylingConfig): ResolvedStyling {
  const resolved: ResolvedStyling = {};
  
  for (const [key, value] of Object.entries(styling)) {
    if (typeof value === 'object') {
      // Recursive resolution for nested styles (hover, active, etc.)
      resolved[key] = resolveDesignTokens(value);
    } else {
      // Resolve individual token
      resolved[key] = resolveToken(value, inferTokenType(key));
    }
  }
  
  return resolved;
}
```

### 3. Style Guide Matching

```typescript
function matchStyleGuide(
  componentType: string,
  styling: ResolvedStyling
): MatchedComponent {
  // Find corresponding component in design system (e.g., Ant Design Button)
  const designSystemComponent = findDesignSystemComponent(componentType);
  
  // Map styling to design system props
  const mappedProps = mapStylingToProps(styling, designSystemComponent);
  
  // Generate class names (Tailwind, CSS Modules, etc.)
  const classNames = generateClassNames(styling);
  
  return {
    component: designSystemComponent,
    props: mappedProps,
    classNames
  };
}
```

### 4. Code Generation

```typescript
function generateComponent(parsed: ParsedSchema, matched: MatchedComponent): GeneratedCode {
  // Generate TypeScript types
  const types = generateTypes(parsed.props);
  
  // Generate React component
  const component = generateReactComponent(parsed, matched);
  
  // Generate tests
  const tests = generateTests(parsed, component);
  
  // Generate Storybook stories
  const stories = generateStories(parsed, component);
  
  // Generate styles (CSS/SCSS/Tailwind)
  const styles = generateStyles(parsed.styling);
  
  return { types, component, tests, stories, styles };
}
```

### 5. Validation

```typescript
function validateComponent(generated: GeneratedCode): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Type check
  const typeErrors = typeCheck(generated.component, generated.types);
  errors.push(...typeErrors);
  
  // Accessibility check
  const a11yErrors = checkAccessibility(generated.component);
  errors.push(...a11yErrors);
  
  // Style check
  const styleErrors = lintStyles(generated.styles);
  errors.push(...styleErrors);
  
  // Test coverage check
  const coverageErrors = checkTestCoverage(generated.tests);
  errors.push(...coverageErrors);
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}
```

---

## Style Guide Matching

### Ant Design Integration

```typescript
const antDesignMappings = {
  Button: {
    componentName: 'Button',
    import: "import { Button } from 'antd';",
    propMappings: {
      variant: 'type', // 'primary' → type="primary"
      size: 'size',    // 'large' → size="large"
      disabled: 'disabled',
      loading: 'loading',
      icon: 'icon',
      shape: 'shape', // 'circle', 'round'
      block: 'block', // full width
      danger: 'danger',
      ghost: 'ghost'
    },
    stylingToProps: {
      'backgroundColor: primary': { type: 'primary' },
      'backgroundColor: secondary': { type: 'default' },
      'backgroundColor: transparent': { ghost: true },
      'borderRadius: full': { shape: 'round' },
      'width: full': { block: true }
    }
  },
  
  Input: {
    componentName: 'Input',
    import: "import { Input } from 'antd';",
    propMappings: {
      size: 'size',
      disabled: 'disabled',
      placeholder: 'placeholder',
      prefix: 'prefix',
      suffix: 'suffix',
      addonBefore: 'addonBefore',
      addonAfter: 'addonAfter',
      allowClear: 'allowClear',
      bordered: 'bordered',
      maxLength: 'maxLength'
    }
  },
  
  Select: {
    componentName: 'Select',
    import: "import { Select } from 'antd';",
    propMappings: {
      mode: 'mode', // 'multiple', 'tags'
      options: 'options',
      placeholder: 'placeholder',
      disabled: 'disabled',
      allowClear: 'allowClear',
      showSearch: 'showSearch',
      filterOption: 'filterOption'
    }
  }
};
```

### Tailwind CSS Integration

```typescript
function generateTailwindClasses(styling: ResolvedStyling): string {
  const classes: string[] = [];
  
  // Map styling to Tailwind classes
  const mappings = {
    backgroundColor: (value) => `bg-${value}`,
    color: (value) => `text-${value}`,
    padding: (value) => `p-${value}`,
    margin: (value) => `m-${value}`,
    borderRadius: (value) => `rounded-${value}`,
    fontSize: (value) => `text-${value}`,
    fontWeight: (value) => `font-${value}`,
    boxShadow: (value) => `shadow-${value}`,
    display: (value) => value, // 'flex', 'grid', etc.
    flexDirection: (value) => `flex-${value}`,
    alignItems: (value) => `items-${value}`,
    justifyContent: (value) => `justify-${value}`,
    gap: (value) => `gap-${value}`
  };
  
  for (const [key, value] of Object.entries(styling)) {
    if (mappings[key]) {
      classes.push(mappings[key](value));
    }
  }
  
  return classes.join(' ');
}
```

---

## Implementation

See `src/services/DesignSystemInterpreter.ts` for the full implementation.

Key classes:

- `DesignSystemInterpreter`: Main orchestrator
- `SchemaParser`: Parses component schemas
- `TokenResolver`: Resolves design tokens
- `StyleMatcher`: Matches design system components
- `CodeGenerator`: Generates React/TypeScript code
- `ComponentValidator`: Validates generated code

---

## Usage Examples

### Basic Usage

```typescript
import { DesignSystemInterpreter } from './services/DesignSystemInterpreter';

const interpreter = new DesignSystemInterpreter({
  designSystem: 'antd',
  styleGuide: 'discord',
  strictMode: true
});

// Compile component from schema
const result = await interpreter.compileComponent(buttonSchema);

console.log(result.component); // React component code
console.log(result.types);     // TypeScript types
console.log(result.tests);     // Jest tests
console.log(result.stories);   // Storybook stories
```

### With Custom Design Tokens

```typescript
const customTokens = {
  colors: {
    brand: '#FF6B6B',
    'brand-dark': '#C92A2A'
  },
  spacing: {
    xs: '2px',
    sm: '4px',
    md: '8px'
  }
};

const interpreter = new DesignSystemInterpreter({
  customTokens,
  designSystem: 'antd'
});

const component = await interpreter.compileComponent(schema);
```

### Batch Compilation

```typescript
const schemas = [buttonSchema, inputSchema, selectSchema];

const results = await interpreter.compileComponents(schemas);

// Save to files
for (const result of results) {
  await fs.writeFile(`${result.name}.tsx`, result.component);
  await fs.writeFile(`${result.name}.types.ts`, result.types);
  await fs.writeFile(`${result.name}.test.tsx`, result.tests);
  await fs.writeFile(`${result.name}.stories.tsx`, result.stories);
}
```

---

## Integration with LightDom

### Integration Points

1. **Schema Library** (`schemas/components/`)
   - Load component schemas
   - Compile to React components
   - Auto-update on schema changes

2. **NeuralComponentBuilder** (`src/schema/NeuralComponentBuilder.ts`)
   - Use interpreter for component generation
   - AI-powered schema creation
   - Auto-enrichment with design tokens

3. **Component Schema Tool Dashboard**
   - Visual schema editor
   - Live preview with interpreter
   - Export compiled components

4. **Design System** (`src/design-system/`)
   - Centralized design tokens
   - Style guide definitions
   - Theme variants

### Workflow

```
Schema Editor → DesignSystemInterpreter → Compiled Component → Preview → Export
```

---

## Best Practices

### 1. Use Semantic Tokens

❌ **Bad:**
```json
{
  "lightdom:styling": {
    "backgroundColor": "#1677ff"
  }
}
```

✅ **Good:**
```json
{
  "lightdom:styling": {
    "backgroundColor": "primary"
  }
}
```

### 2. Define Variants

```json
{
  "lightdom:variants": [
    { "name": "primary", "styling": { "backgroundColor": "primary" } },
    { "name": "secondary", "styling": { "backgroundColor": "secondary" } },
    { "name": "ghost", "styling": { "backgroundColor": "transparent" } }
  ]
}
```

### 3. Always Include Accessibility

```json
{
  "lightdom:accessibility": {
    "role": "button",
    "ariaLabel": "Submit form",
    "keyboardNavigable": true,
    "focusVisible": true
  }
}
```

### 4. Test Compiled Components

```typescript
// Auto-generated test
describe('PrimaryButton', () => {
  it('renders without errors', () => {
    render(<PrimaryButton>Click me</PrimaryButton>);
  });
  
  it('handles click events', () => {
    const onClick = jest.fn();
    render(<PrimaryButton onClick={onClick}>Click me</PrimaryButton>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
  
  it('is accessible', () => {
    const { container } = render(<PrimaryButton>Click me</PrimaryButton>);
    expect(container).toHaveNoViolations(); // axe-core
  });
});
```

### 5. Use Component Composition

```json
{
  "@type": "Form",
  "lightdom:children": [
    { "$ref": "lightdom:component:input:email" },
    { "$ref": "lightdom:component:input:password" },
    { "$ref": "lightdom:component:button:submit" }
  ]
}
```

---

## Performance Considerations

### Caching

```typescript
class DesignSystemInterpreter {
  private cache = new Map<string, GeneratedCode>();
  
  async compileComponent(schema: ComponentSchema): Promise<GeneratedCode> {
    const cacheKey = this.getCacheKey(schema);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const result = await this.compile(schema);
    this.cache.set(cacheKey, result);
    
    return result;
  }
}
```

### Incremental Compilation

Only recompile components that changed:

```typescript
function needsRecompilation(schema: ComponentSchema, lastCompiled: Timestamp): boolean {
  return schema.updatedAt > lastCompiled;
}
```

### Code Splitting

Generate separate bundles for component libraries:

```typescript
// Button.lazy.tsx
export const Button = lazy(() => import('./Button'));
```

---

## Conclusion

The Design System Interpreter provides a powerful, schema-driven approach to component compilation that:

- ✅ Ensures design consistency
- ✅ Eliminates manual coding errors
- ✅ Enforces accessibility standards
- ✅ Enables rapid prototyping
- ✅ Supports multiple design systems
- ✅ Provides type safety
- ✅ Generates tests automatically
- ✅ Integrates seamlessly with LightDom

By using schemas as the single source of truth, teams can maintain a consistent design system while dramatically reducing development time and errors.
