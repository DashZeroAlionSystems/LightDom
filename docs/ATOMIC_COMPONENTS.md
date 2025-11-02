# Atomic Component System

## Overview

The LightDom platform uses an **Atomic Design** approach to component development, making it easy to generate and compose UI components from smaller, reusable pieces.

## Component Hierarchy

### Atoms (Level 1)
The smallest building blocks of the UI. These cannot be broken down further.

**Available Atomic Components (13):**
- `button.json` - Clickable buttons with variants
- `input.json` - Text input fields
- `label.json` - Text labels for form fields
- `card.json` - Container cards
- `select.json` - Dropdown selects
- `checkbox.json` - Checkbox inputs
- `radio.json` - Radio button inputs
- `textarea.json` - Multi-line text inputs
- `badge.json` - Status badges and tags
- `alert.json` - Alert messages
- `spinner.json` - Loading spinners
- `link.json` - Hyperlinks
- `icon.json` - Icons

### Molecules (Level 2)
Simple combinations of atoms that function together as a unit.

**Available Molecular Components (2):**
- `form-field.json` - Complete form field (label + input + error)
- `search-bar.json` - Search input with button

### Organisms (Level 3)
Complex UI components composed of molecules and atoms.

**Available Organism Components (5):**
- `login-form.json` - Complete login form with email, password, remember me
- `user-profile-card.json` - User profile card with avatar and actions
- `data-grid.json` - Advanced data grid with sorting, filtering, pagination
- `nav-bar.json` - Navigation bar with logo, menu items, user actions
- `modal-dialog.json` - Modal dialog with header, content, and action buttons

## Quick Start

```bash
# Initialize services and load all atomic schemas
npm run init:services

# This will:
# - Run database migrations
# - Load 20 component schemas (13 atoms + 2 molecules + 5 organisms)
# - Make all components available for generation
```

## Generating Components

### Single Component Generation

```typescript
import { componentGeneratorService } from './services/ComponentGeneratorService';

const component = await componentGeneratorService.generateComponent({
  componentName: 'UserProfileForm',
  componentType: 'organism',
  baseComponents: ['ld:form-field', 'ld:button', 'ld:card'],
  requirements: {
    functionality: 'User profile editing form with validation',
    designSystem: 'Material Design 3',
    accessibility: true,
    responsive: true
  },
  aiGeneration: {
    useAI: true,
    includeTests: true
  },
  output: {
    directory: 'src/components/generated',
    typescript: true
  }
});
```

### Component Assembly Workflow

Generate multiple related components at once:

```typescript
import { componentAssemblyWorkflowService } from './services/ComponentAssemblyWorkflowService';

const result = await componentAssemblyWorkflowService.executeAssembly({
  projectName: 'UserManagement',
  description: 'Complete user management UI',
  components: [
    {
      name: 'UserList',
      type: 'organism',
      useCase: 'Display users in a sortable, filterable grid',
      baseComponents: ['ld:data-grid']
    },
    {
      name: 'UserForm',
      type: 'organism',
      useCase: 'Create and edit user profiles',
      baseComponents: ['ld:form-field', 'ld:button']
    },
    {
      name: 'UserCard',
      type: 'molecule',
      useCase: 'Display user summary card',
      baseComponents: ['ld:card', 'ld:badge']
    }
  ],
  outputDirectory: 'src/components/users',
  designSystem: 'Material Design 3',
  includeTests: true,
  includeStories: true
});

console.log(`Generated ${result.summary.successCount} components`);
```

### Using NeuralComponentBuilder

The NeuralComponentBuilder provides AI-powered component generation:

```typescript
import NeuralComponentBuilder from './src/schema/NeuralComponentBuilder';
import SchemaComponentMapper from './src/schema/SchemaComponentMapper';

const mapper = new SchemaComponentMapper();
const builder = new NeuralComponentBuilder(mapper);
await builder.initialize();

// Generate using atomic library
const component = await builder.generateComponentFromAtoms({
  useCase: 'user login form with email and password',
  context: {
    framework: 'react',
    style: 'functional',
    typescript: true,
    testingLibrary: 'vitest'
  },
  constraints: {
    accessibility: true,
    responsive: true
  }
});

console.log(component.code);
console.log(component.tests);
```

## Complete Example: Building a Dashboard

```typescript
import { componentAssemblyWorkflowService } from './services/ComponentAssemblyWorkflowService';

// Define the dashboard components
const result = await componentAssemblyWorkflowService.executeAssembly({
  projectName: 'AdminDashboard',
  description: 'Complete admin dashboard with navigation, data grid, and modals',
  components: [
    {
      name: 'DashboardLayout',
      type: 'template',
      useCase: 'Admin dashboard layout with sidebar and main content area',
      baseComponents: ['ld:nav-bar']
    },
    {
      name: 'UsersTable',
      type: 'organism',
      useCase: 'User management table with sorting and filtering',
      baseComponents: ['ld:data-grid', 'ld:button']
    },
    {
      name: 'CreateUserModal',
      type: 'organism',
      useCase: 'Modal form for creating new users',
      baseComponents: ['ld:modal-dialog', 'ld:form-field', 'ld:button']
    },
    {
      name: 'UserStatsCard',
      type: 'molecule',
      useCase: 'Display user statistics in a card',
      baseComponents: ['ld:card', 'ld:badge', 'ld:icon']
    }
  ],
  outputDirectory: 'src/components/dashboard',
  designSystem: 'Material Design 3',
  includeTests: true,
  includeStories: true
});

// All components generated with tests and stories!
// - src/components/dashboard/DashboardLayout.tsx
// - src/components/dashboard/UsersTable.tsx
// - src/components/dashboard/CreateUserModal.tsx
// - src/components/dashboard/UserStatsCard.tsx
// - src/components/dashboard/index.ts (auto-generated)
```

## Features

### 🚀 Rapid Development
- Generate complete components in seconds
- Assembly workflows for multiple components
- Auto-generated tests and Storybook stories

### 🎯 Consistency
- All components follow atomic design principles
- Consistent design system implementation
- Standard code patterns and structure

### 🔍 Discoverability
- Search components by tags and use cases
- 20 pre-built component schemas
- Semantic meaning for intelligent selection

### 🧪 Quality
- Auto-generated unit tests
- TypeScript type safety
- WCAG 2.1 AA accessibility

### 📚 Documentation
- Auto-generated Storybook stories
- JSDoc comments in code
- Comprehensive component docs

## API Reference

### ComponentGeneratorService
```typescript
generateComponent(request: ComponentGenerationRequest): Promise<GeneratedComponent>
```

### ComponentAssemblyWorkflowService
```typescript
executeAssembly(request: ComponentAssemblyRequest): Promise<AssemblyResult>
getWorkflowResults(): Promise<any[]>
```

### NeuralComponentBuilder
```typescript
generateComponentFromAtoms(request: NeuralBuildRequest): Promise<GeneratedComponent>
generateComponent(request: NeuralBuildRequest): Promise<GeneratedComponent>
```

See complete documentation in `docs/ATOMIC_COMPONENTS_OLD.md`.
