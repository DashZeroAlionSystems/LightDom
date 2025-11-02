# Wizard UX Patterns Research

## Overview
This document provides comprehensive research on wizard (stepper) UX patterns for multi-step workflows, forms, and configuration interfaces.

## Best Practices for Wizard Design

### 1. Visual Progress Indication
**Purpose:** Users need to understand where they are in the process and how much remains.

**Patterns:**
- **Linear Progress Bar**: Shows percentage completion
- **Step Indicators**: Numbered circles or checkmarks for each step
- **Breadcrumb Trail**: Text-based navigation showing step names
- **Visual Timeline**: Horizontal or vertical timeline with milestones

**Implementation:**
```typescript
interface WizardProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  percentage: number;
}
```

### 2. Step Validation and Error Handling

**Principles:**
- Validate each step before allowing progression
- Show inline errors immediately
- Provide clear error messages with actionable fixes
- Allow users to fix errors without losing data

**Patterns:**
- **Immediate Validation**: Check fields on blur/change
- **Step-level Validation**: Validate entire step before "Next"
- **Global Validation**: Final check before submission
- **Error Summary**: List all errors at top of step

### 3. Navigation Patterns

**Forward Navigation:**
- Primary action button (Next/Continue)
- Disabled until step is valid
- Clear label indicating next step

**Backward Navigation:**
- Secondary action button (Back/Previous)
- Always enabled (allow return to fix errors)
- Preserves entered data

**Skip/Jump Navigation:**
- Allow jumping to completed steps
- Show incomplete/blocked steps
- Provide "Save Draft" for long workflows

### 4. Data Persistence

**Auto-save Patterns:**
- Save on step completion
- Periodic auto-save (every 30s)
- Save to localStorage for draft recovery
- Clear indication of save status

**Schema:**
```typescript
interface WizardDraft {
  id: string;
  userId: string;
  workflowType: string;
  currentStep: number;
  data: Record<string, any>;
  lastSaved: Date;
  expiresAt: Date;
}
```

### 5. Step Types

**Different step patterns serve different purposes:**

#### a) Form Step
- Multiple input fields
- Validation rules
- Helper text and tooltips
- Field dependencies

#### b) Review Step
- Summary of all entered data
- Edit buttons for each section
- Visual hierarchy of information
- Confirmation actions

#### c) Selection Step
- Choose from options (cards, radio, checkboxes)
- Visual previews
- Comparison features
- Search/filter for many options

#### d) Upload Step
- Drag & drop interface
- File preview
- Progress indication
- Validation (file type, size)

#### e) Confirmation Step
- Final review
- Terms acceptance
- Submit action
- Loading states

### 6. Responsive Design

**Mobile Considerations:**
- Vertical step indicators
- Sticky navigation buttons
- Touch-friendly targets (44x44px minimum)
- Simplified layouts
- Progressive disclosure

**Desktop:**
- Horizontal step indicators
- Side-by-side layouts
- Keyboard navigation (Tab, Enter, Esc)
- Contextual help panels

### 7. Accessibility

**WCAG 2.1 AA Requirements:**
- ARIA labels for steps and status
- Keyboard navigation support
- Focus management between steps
- Screen reader announcements
- Color contrast requirements
- Error identification

**Implementation:**
```typescript
<nav aria-label="Progress">
  <ol role="list">
    <li aria-current={isActive ? "step" : undefined}>
      <span className="sr-only">Step {index + 1}</span>
      <span>{step.title}</span>
      {step.status === 'completed' && (
        <span className="sr-only">Completed</span>
      )}
    </li>
  </ol>
</nav>
```

### 8. Micro-interactions

**Enhance UX with subtle animations:**
- Fade in/out between steps
- Slide transitions
- Check mark animations on completion
- Loading spinners during async operations
- Success celebrations on final submission

### 9. Context and Help

**Provide guidance without overwhelming:**
- Inline help text (subtle, expandable)
- Contextual tooltips
- Progress-aware tips
- Example inputs
- Help sidebar (optional)
- Chat support integration

### 10. Schema-Driven Wizards

**For our use case with prompt-driven component generation:**

```typescript
interface SchemaWizardStep {
  id: string;
  title: string;
  schemaType: 'atom' | 'component' | 'dashboard' | 'workflow';
  
  // Schema definition for this step
  schema: {
    fields: SchemaField[];
    relationships: SchemaRelation[];
    metadata: Record<string, any>;
  };
  
  // AI-generated configuration from prompt
  generatedConfig: Record<string, any>;
  
  // User edits to generated config
  userEdits: Record<string, any>;
  
  // Validation rules
  validation: ValidationRule[];
}

interface SchemaField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  description?: string;
  defaultValue?: any;
  options?: Array<{ value: any; label: string }>;
  required?: boolean;
  validation?: ValidationRule[];
}
```

## Wizard Patterns for Our System

### 1. Campaign Creation Wizard

**Flow:**
1. **Prompt Input**: User enters natural language description
2. **AI Processing**: Generate workflow schema from prompt
3. **Schema Review**: Display generated atoms, components, dashboards
4. **Configuration**: Edit settings for each component
5. **Workflow Setup**: Configure automation rules
6. **Review & Launch**: Final confirmation and execution

### 2. Component Builder Wizard

**Flow:**
1. **Type Selection**: Choose atom/component/dashboard
2. **Base Template**: Select from existing patterns
3. **Customization**: Edit properties and styling
4. **Schema Linking**: Connect to related schemas
5. **Preview**: Visual preview of component
6. **Save**: Add to component library

### 3. Workflow Configuration Wizard

**Flow:**
1. **Template Selection**: Choose workflow template
2. **Task Configuration**: Set up each workflow task
3. **Atom Mapping**: Link atoms to workflow steps
4. **Component Assembly**: Build dashboard components
5. **Settings**: Admin vs client configurations
6. **Testing**: Validation and preview
7. **Deployment**: Launch workflow

## Advanced Patterns

### 1. Branching Wizards
- Conditional steps based on previous answers
- Different paths for different user types
- Skip irrelevant sections

### 2. Parallel Wizards
- Multiple wizards running simultaneously
- Shared data between wizards
- Synchronized completion

### 3. Nested Wizards
- Sub-wizards within main wizard
- Hierarchical configuration
- Independent completion tracking

### 4. Resume Capability
- Save draft at any point
- Email link to resume
- Multi-device support
- Expiration handling

## Schema Editor Patterns

### 1. Visual Schema Editor
```typescript
interface SchemaEditorProps {
  schema: ComponentSchema;
  onSchemaChange: (schema: ComponentSchema) => void;
  mode: 'visual' | 'code' | 'split';
}

// Features:
// - Drag & drop field ordering
// - Visual relationship mapping
// - Real-time validation
// - Code preview panel
// - Import/export capabilities
```

### 2. Field Configuration
```typescript
interface FieldEditor {
  field: SchemaField;
  
  // Configuration options
  settings: {
    label: string;
    description: string;
    type: FieldType;
    defaultValue: any;
    validation: ValidationRule[];
    uiHints: {
      placeholder?: string;
      helpText?: string;
      icon?: string;
      grouping?: string;
    };
  };
  
  // Preview
  preview: React.ComponentType;
}
```

### 3. Relationship Mapping
```typescript
interface SchemaRelationEditor {
  sourceSchema: ComponentSchema;
  targetSchema: ComponentSchema;
  relationType: 'oneToOne' | 'oneToMany' | 'manyToMany';
  mappings: Array<{
    sourceField: string;
    targetField: string;
    transform?: string;
  }>;
}
```

## Prompt Engineering for Component Generation

### 1. Prompt Structure
```
Create a [component-type] for [purpose]
Requirements:
- [requirement 1]
- [requirement 2]
Data fields: [field list]
Styling: [style preferences]
Behavior: [interaction patterns]
```

### 2. Context Enrichment
- Include existing component library
- Reference design system tokens
- Provide schema templates
- Add usage examples

### 3. Validation
- Check generated schema validity
- Verify relationships
- Validate against design system
- Test with sample data

## Implementation Recommendations

### For LightDom Platform

1. **Start Simple**: Begin with linear wizard for campaign creation
2. **Iterate**: Add branching and nesting as needed
3. **Auto-save**: Implement aggressive draft saving
4. **Preview**: Show live preview of generated components
5. **Undo/Redo**: Allow easy reversal of changes
6. **Templates**: Build library of common patterns
7. **Learning**: Collect data on user edits to improve AI
8. **Testing**: Validate generated schemas before deployment
9. **Documentation**: Auto-generate docs from schemas
10. **Versioning**: Track schema versions and migrations

## References

- Material Design Steppers: https://m3.material.io/components/steppers
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Nielsen Norman Group - Wizard Design: https://www.nngroup.com/articles/wizards/
- Baymard Institute - Checkout Usability: https://baymard.com/checkout-usability
- Schema.org Vocabulary: https://schema.org/

## Next Steps

1. Implement enhanced wizard component with schema support
2. Create schema editor components
3. Build prompt parsing and schema generation
4. Integrate Ollama DeepSeek R1 API
5. Develop training data collection system
6. Create component preview renderer
7. Build workflow execution engine
