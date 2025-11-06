# Enhanced Config Editor - Usage Guide

## Overview

The Enhanced Config Editor is a production-ready, schema-driven React component for building visual configuration interfaces with advanced features like real-time validation, dual editing modes, template support, and change tracking.

## Features

✅ **Dual Mode Editing** - Visual form and JSON text modes  
✅ **Real-time Validation** - Immediate feedback on field values  
✅ **Smart Field Rendering** - 20+ field types automatically rendered  
✅ **Template Support** - Load/save configuration templates  
✅ **Change Tracking** - Visual diff of modifications  
✅ **Auto-save** - Configurable auto-save functionality  
✅ **Accessibility** - WCAG compliant with keyboard navigation  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **Progressive Disclosure** - Basic, Advanced, and Expert tabs  
✅ **Conditional Fields** - Show/hide based on other field values  

## Installation

```bash
npm install antd react
```

## Basic Usage

```jsx
import React from 'react';
import { EnhancedConfigEditor } from './components/EnhancedConfigEditor';

const schema = {
  title: 'Workflow Configuration',
  description: 'Configure your data mining workflow',
  fields: [
    {
      name: 'name',
      type: 'string',
      label: 'Workflow Name',
      required: true,
      placeholder: 'Enter workflow name...',
      help: 'A descriptive name for your workflow'
    },
    {
      name: 'url',
      type: 'url',
      label: 'Target URL',
      required: true,
      placeholder: 'https://example.com'
    },
    {
      name: 'timeout',
      type: 'number',
      label: 'Timeout (ms)',
      level: 'advanced',
      default: 30000,
      min: 1000,
      max: 300000
    }
  ]
};

const initialValues = {
  name: '',
  url: '',
  timeout: 30000
};

function MyConfigForm() {
  const handleSave = (values) => {
    console.log('Saving configuration:', values);
    // Save to API
  };
  
  const handleChange = (name, value) => {
    console.log('Field changed:', name, value);
  };
  
  return (
    <EnhancedConfigEditor
      schema={schema}
      initialValues={initialValues}
      onSave={handleSave}
      onChange={handleChange}
      autoSave={true}
      autoSaveDelay={3000}
    />
  );
}
```

## Schema Definition

### Field Types

The component supports 20+ field types:

```javascript
{
  // Text inputs
  type: 'string'        // Basic text input
  type: 'text'          // Same as string
  type: 'textarea'      // Multi-line text area
  type: 'email'         // Email with validation
  type: 'url'           // URL with validation
  type: 'password'      // Password input (hidden)
  
  // Numbers
  type: 'number'        // Number input
  type: 'integer'       // Integer only
  type: 'slider'        // Slider for ranges
  type: 'range'         // Same as slider
  
  // Selections
  type: 'select'        // Dropdown select
  type: 'multiselect'   // Multi-select dropdown
  type: 'radio'         // Radio button group
  type: 'checkbox'      // Single checkbox
  type: 'switch'        // Toggle switch
  type: 'boolean'       // Same as switch
  
  // Dates
  type: 'date'          // Date picker
  type: 'time'          // Time picker
  type: 'datetime'      // Date and time picker
  
  // Advanced
  type: 'json'          // JSON editor
  type: 'code'          // Code editor
  type: 'color'         // Color picker
}
```

### Complete Field Definition

```javascript
{
  // Required properties
  name: 'fieldName',        // Field identifier
  type: 'string',           // Field type
  
  // Display properties
  label: 'Field Label',     // Display label
  placeholder: 'Enter...', // Placeholder text
  help: 'Help text',        // Help tooltip
  description: 'Description', // Field description
  extra: 'Extra info',      // Additional info below field
  
  // Validation
  required: true,           // Is field required?
  minLength: 3,            // Min string length
  maxLength: 50,           // Max string length
  min: 0,                  // Min number value
  max: 100,                // Max number value
  pattern: '^[a-z]+$',     // Regex pattern
  patternMessage: 'Error', // Pattern error message
  validate: (val) => {...}, // Custom validator
  
  // Configuration
  level: 'basic',          // 'basic' | 'advanced' | 'expert'
  default: 'value',        // Default value
  showCount: true,         // Show character count
  rows: 4,                 // Textarea rows
  step: 1,                 // Number step
  
  // Conditional rendering
  showIf: {                // Conditional display
    field: 'otherField',
    equals: 'value'
  },
  
  // Select options
  options: [               // For select/radio/multiselect
    'option1',
    'option2',
    { value: 'opt3', label: 'Option 3', recommended: true }
  ],
  
  // UI customization
  prefix: '🔍',           // Input prefix
  searchable: true,        // Searchable select
  checkedLabel: 'On',      // Switch on label
  uncheckedLabel: 'Off'    // Switch off label
}
```

## Complete Example

```jsx
import React, { useState } from 'react';
import { EnhancedConfigEditor } from './components/EnhancedConfigEditor';

const workflowSchema = {
  title: 'Data Mining Workflow',
  description: 'Configure your data mining workflow with advanced options',
  fields: [
    // Basic Fields
    {
      name: 'name',
      type: 'string',
      label: 'Workflow Name',
      level: 'basic',
      required: true,
      minLength: 3,
      maxLength: 50,
      placeholder: 'My Workflow',
      help: 'Choose a descriptive name',
      showCount: true
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      level: 'basic',
      rows: 3,
      placeholder: 'Describe what this workflow does...'
    },
    {
      name: 'url',
      type: 'url',
      label: 'Target URL',
      level: 'basic',
      required: true,
      placeholder: 'https://example.com',
      help: 'The website to analyze'
    },
    {
      name: 'tool',
      type: 'select',
      label: 'Data Mining Tool',
      level: 'basic',
      required: true,
      options: [
        { value: 'puppeteer-scraper', label: 'Puppeteer Scraper', recommended: true },
        { value: 'playwright-cross-browser', label: 'Playwright Cross-Browser' },
        { value: 'devtools-performance', label: 'DevTools Performance' },
        { value: 'hybrid-pattern-miner', label: 'Hybrid Pattern Miner' }
      ],
      searchable: true
    },
    {
      name: 'enabled',
      type: 'switch',
      label: 'Enabled',
      level: 'basic',
      default: true,
      checkedLabel: 'Active',
      uncheckedLabel: 'Inactive'
    },
    
    // Advanced Fields
    {
      name: 'timeout',
      type: 'number',
      label: 'Timeout (ms)',
      level: 'advanced',
      default: 30000,
      min: 1000,
      max: 300000,
      step: 1000,
      help: 'Maximum time to wait for page load'
    },
    {
      name: 'retries',
      type: 'number',
      label: 'Retry Attempts',
      level: 'advanced',
      default: 3,
      min: 0,
      max: 10,
      help: 'Number of retry attempts on failure'
    },
    {
      name: 'priority',
      type: 'slider',
      label: 'Priority',
      level: 'advanced',
      default: 5,
      min: 1,
      max: 10,
      marks: {
        1: 'Low',
        5: 'Normal',
        10: 'High'
      }
    },
    {
      name: 'tags',
      type: 'multiselect',
      label: 'Tags',
      level: 'advanced',
      options: ['production', 'testing', 'development', 'staging'],
      placeholder: 'Select tags...'
    },
    {
      name: 'schedule',
      type: 'select',
      label: 'Schedule',
      level: 'advanced',
      options: [
        'manual',
        'hourly',
        'daily',
        'weekly',
        'monthly'
      ]
    },
    
    // Expert Fields
    {
      name: 'customHeaders',
      type: 'json',
      label: 'Custom Headers',
      level: 'expert',
      rows: 6,
      help: 'JSON object with custom HTTP headers',
      default: {}
    },
    {
      name: 'maxConcurrentJobs',
      type: 'number',
      label: 'Max Concurrent Jobs',
      level: 'expert',
      default: 5,
      min: 1,
      max: 20
    },
    {
      name: 'debugMode',
      type: 'switch',
      label: 'Debug Mode',
      level: 'expert',
      default: false
    }
  ]
};

const templates = [
  {
    name: 'Default Configuration',
    values: {
      name: 'Default Workflow',
      url: 'https://example.com',
      tool: 'puppeteer-scraper',
      enabled: true,
      timeout: 30000,
      retries: 3,
      priority: 5,
      tags: [],
      schedule: 'manual',
      customHeaders: {},
      maxConcurrentJobs: 5,
      debugMode: false
    }
  },
  {
    name: 'Production Setup',
    values: {
      name: 'Production Workflow',
      url: 'https://example.com',
      tool: 'hybrid-pattern-miner',
      enabled: true,
      timeout: 60000,
      retries: 5,
      priority: 10,
      tags: ['production'],
      schedule: 'hourly',
      customHeaders: {},
      maxConcurrentJobs: 10,
      debugMode: false
    }
  },
  {
    name: 'Development Setup',
    values: {
      name: 'Dev Workflow',
      url: 'http://localhost:3000',
      tool: 'puppeteer-scraper',
      enabled: true,
      timeout: 15000,
      retries: 1,
      priority: 3,
      tags: ['development'],
      schedule: 'manual',
      customHeaders: {},
      maxConcurrentJobs: 2,
      debugMode: true
    }
  }
];

function WorkflowConfigEditor() {
  const [config, setConfig] = useState({});
  
  const handleSave = async (values) => {
    console.log('Saving workflow configuration:', values);
    
    try {
      const response = await fetch('/api/datamining/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Workflow saved:', result);
        setConfig(values);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };
  
  const handleChange = (name, value) => {
    console.log(`Field ${name} changed to:`, value);
    // Real-time updates if needed
  };
  
  return (
    <div style={{ padding: 24 }}>
      <EnhancedConfigEditor
        schema={workflowSchema}
        initialValues={config}
        onSave={handleSave}
        onChange={handleChange}
        templates={templates}
        showTemplates={true}
        showDiff={true}
        autoSave={true}
        autoSaveDelay={3000}
      />
    </div>
  );
}

export default WorkflowConfigEditor;
```

## Props API

```typescript
interface EnhancedConfigEditorProps {
  // Required
  schema: Schema;                    // Schema definition
  
  // Optional
  initialValues?: object;            // Initial form values
  onSave?: (values: object) => void; // Save callback
  onChange?: (name: string, value: any) => void; // Change callback
  templates?: Template[];            // Configuration templates
  showTemplates?: boolean;           // Show template selector
  showDiff?: boolean;                // Show diff drawer
  autoSave?: boolean;                // Enable auto-save
  autoSaveDelay?: number;            // Auto-save delay (ms)
}

interface Schema {
  title?: string;                    // Editor title
  description?: string;              // Editor description
  fields: Field[];                   // Field definitions
}

interface Field {
  name: string;                      // Field identifier
  type: string;                      // Field type
  label?: string;                    // Display label
  level?: 'basic' | 'advanced' | 'expert'; // Complexity level
  required?: boolean;                // Is required?
  default?: any;                     // Default value
  placeholder?: string;              // Placeholder text
  help?: string;                     // Help tooltip
  description?: string;              // Field description
  validate?: (value: any) => string | null; // Custom validator
  showIf?: { field: string; equals: any }; // Conditional display
  // ... (see Complete Field Definition above)
}

interface Template {
  name: string;                      // Template name
  values: object;                    // Configuration values
}
```

## Styling

The component uses Ant Design components and can be customized with CSS:

```css
/* Custom styling */
.enhanced-config-editor {
  /* Your styles */
}

.enhanced-config-editor h2 {
  color: #1890ff;
}

/* Dark theme */
.enhanced-config-editor.dark-theme {
  background: #1f1f1f;
  color: #fff;
}
```

## Advanced Features

### Custom Validation

```javascript
{
  name: 'apiKey',
  type: 'password',
  label: 'API Key',
  validate: async (value) => {
    if (!value) return 'API key is required';
    
    // Check format
    if (!/^sk-[a-zA-Z0-9]{32}$/.test(value)) {
      return 'Invalid API key format';
    }
    
    // Verify with API
    try {
      const response = await fetch('/api/verify-key', {
        method: 'POST',
        body: JSON.stringify({ key: value })
      });
      
      if (!response.ok) {
        return 'API key verification failed';
      }
    } catch (error) {
      return 'Unable to verify API key';
    }
    
    return null; // Valid
  }
}
```

### Conditional Fields

```javascript
{
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      options: ['api', 'html', 'xml']
    },
    {
      name: 'apiKey',
      type: 'password',
      label: 'API Key',
      showIf: { field: 'type', equals: 'api' }
    },
    {
      name: 'xpath',
      type: 'string',
      label: 'XPath',
      showIf: { field: 'type', equals: 'xml' }
    }
  ]
}
```

### Dynamic Options

```javascript
{
  name: 'category',
  type: 'select',
  label: 'Category',
  options: async () => {
    const response = await fetch('/api/categories');
    const categories = await response.json();
    return categories.map(c => ({
      value: c.id,
      label: c.name
    }));
  }
}
```

## Best Practices

1. **Group Related Fields**: Use `level` to organize fields by complexity
2. **Provide Help Text**: Always include `help` or `description` for clarity
3. **Set Sensible Defaults**: Use `default` to pre-populate common values
4. **Validate Early**: Use `required`, `min`, `max`, `pattern` for immediate feedback
5. **Use Templates**: Provide templates for common configurations
6. **Enable Auto-save**: Prevent data loss with auto-save functionality
7. **Progressive Disclosure**: Start with basic fields, hide advanced options
8. **Clear Error Messages**: Write specific, actionable error messages

## Accessibility

The component is WCAG 2.1 Level AA compliant with:
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support (ARIA labels)
- Focus indicators
- Color contrast (4.5:1)
- Error announcements

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Performance

- Lazy field rendering
- Debounced validation (300ms)
- Memoized computations
- Optimized re-renders

## License

MIT

## Support

For issues or questions:
- Check the research document: `CONFIG_EDITOR_UI_RESEARCH.md`
- Review examples above
- Open an issue on GitHub
