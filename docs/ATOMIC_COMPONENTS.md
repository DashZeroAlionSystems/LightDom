# Atomic Component System

## Overview

The LightDom platform uses an **Atomic Design** approach to component development, making it easy to generate and compose UI components from smaller, reusable pieces.

## Component Hierarchy

### Atoms (Level 1)
The smallest building blocks of the UI. These cannot be broken down further.

**Available Atomic Components:**
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

**Available Molecular Components:**
- `form-field.json` - Complete form field (label + input + error)
- `search-bar.json` - Search input with button

## Quick Start

```bash
# Initialize services and load all atomic schemas
npm run init:services

# This will:
# - Run database migrations
# - Load atomic component schemas from schemas/components/
# - Make all components available for generation
```

## Generating Components

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

See `docs/ATOMIC_COMPONENTS_OLD.md` for complete documentation.
