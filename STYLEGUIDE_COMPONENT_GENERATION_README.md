# Style Guide & Component Generation System

## 🎯 Overview

This comprehensive system provides end-to-end automation for extracting design systems from any website, generating components, and creating complete Storybook documentation. It leverages AI (DeepSeek) fine-tuning for intelligent component generation based on style guides.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     URL or Design Specification                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│            Style Guide Data Mining Service                      │
│  • Extract design tokens (colors, typography, spacing)          │
│  • Detect component patterns                                    │
│  • Mine 3D DOM layer data                                       │
│  • Identify framework (React, Vue, Angular)                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           DeepSeek Component Fine-tuning Service                │
│  • Generate training data from style guides                     │
│  • Fine-tune DeepSeek model                                     │
│  • Generate components from prompts                             │
│  • Create component variations and states                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│          Storybook Component Generator Service                  │
│  • Generate Storybook stories                                   │
│  • Create interactive documentation                             │
│  • Document variants and states                                 │
│  • Add accessibility tests                                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Generated Output                              │
│  • Component Library (React/Vue/Angular)                        │
│  • Complete Storybook Documentation                             │
│  • Design Token Files (CSS/SCSS/Tailwind)                       │
│  • Training Data for Fine-tuning                                │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Core Services

### 1. Style Guide Data Mining Service
**File**: `services/styleguide-data-mining-service.js`

Extracts comprehensive design information from websites:

- **Design Tokens**:
  - Colors (primary, secondary, semantic)
  - Typography (font families, sizes, weights)
  - Spacing (8px grid system)
  - Elevation/Shadows
  - Border radius
  - Animations & transitions

- **Component Detection**:
  - Buttons, Cards, Inputs, Navigation
  - 25+ common component patterns
  - Variants for each component
  - Interactive states (hover, focus, disabled)

- **Framework Detection**:
  - React, Vue, Angular, Svelte
  - Version detection
  - Confidence scoring

**Usage**:
```javascript
import { StyleGuideDataMiningService } from './services/styleguide-data-mining-service.js';

const service = new StyleGuideDataMiningService();
await service.initialize();

const styleGuide = await service.mineStyleGuideFromUrl('https://material.io');
```

### 2. DeepSeek Component Fine-tuning Service
**File**: `services/deepseek-component-finetuning-service.js`

Generates components using AI with fine-tuning capabilities:

- **Training Data Generation**:
  - From style guides
  - From existing components
  - Component + Storybook pairs
  - Variant examples

- **Component Generation**:
  - From natural language prompts
  - Based on style guides
  - With TypeScript types
  - Accessibility built-in

- **Model Fine-tuning**:
  - Prepares training data in JSONL format
  - Integrates with DeepSeek API
  - Tracks fine-tuning progress

**Usage**:
```javascript
import { DeepSeekComponentFinetuningService } from './services/deepseek-component-finetuning-service.js';

const service = new DeepSeekComponentFinetuningService();
await service.initialize();

// Generate component
const component = await service.generateComponent(
  'Generate a Material Design button component',
  styleGuide,
  { framework: 'react', save: true }
);

// Generate training data
const trainingData = await service.generateTrainingDataFromStyleGuide(styleGuide);
await service.saveTrainingData('my-training-data.jsonl');
```

### 3. Storybook Component Generator Service
**File**: `services/storybook-component-generator-service.js`

Creates complete Storybook documentation:

- **Story Generation**:
  - Default story
  - Variant stories
  - State stories
  - Size variations
  - Interactive tests

- **Documentation**:
  - Introduction page
  - Design tokens documentation
  - Component documentation (MDX)
  - Accessibility guidelines

**Usage**:
```javascript
import { StorybookComponentGeneratorService } from './services/storybook-component-generator-service.js';

const service = new StorybookComponentGeneratorService();
await service.initialize();

const storybook = await service.generateStorybookFromStyleGuide(
  styleGuide,
  componentLibrary
);
```

### 4. Style Guide to Storybook Orchestrator
**File**: `services/styleguide-to-storybook-orchestrator.js`

Coordinates the entire workflow:

- **Complete Workflow**: URL → Style Guide → Components → Storybook
- **Multi-URL Mining**: Mine and merge multiple design systems
- **Training Data Management**: Collect and organize training data
- **Progress Tracking**: Real-time progress updates

**Usage**:
```javascript
import { StyleGuideToStorybookOrchestrator } from './services/styleguide-to-storybook-orchestrator.js';

const orchestrator = new StyleGuideToStorybookOrchestrator();
await orchestrator.initialize();

// Process a URL
const workflow = await orchestrator.processUrl('https://material.io', {
  libraryName: 'MaterialComponents',
  framework: 'react',
  generateTrainingData: true
});

// Mine multiple URLs
const mergedStyleGuide = await orchestrator.mineMultipleUrls([
  'https://material.io',
  'https://ant.design',
  'https://chakra-ui.com'
]);
```

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your DeepSeek API key to .env
```

### Run the Demo

```bash
# Run the complete demo
npm run styleguide:demo

# Mine a specific URL
npm run styleguide:demo https://material.io

# Start Storybook to view generated components
npm run storybook
```

### Step-by-Step Workflow

#### 1. Mine a Style Guide

```bash
node demo-styleguide-generator.js https://your-target-url.com
```

This will:
- Extract design tokens
- Detect components
- Generate training data
- Create component library
- Build Storybook documentation

#### 2. Generate Training Data

```bash
# From style guide
npm run finetune:generate-data

# From existing components
node services/deepseek-component-finetuning-service.js --from-components ./src/components
```

#### 3. Fine-tune DeepSeek Model

```bash
npm run finetune:train
```

#### 4. Generate Components

```javascript
// Use the fine-tuned model to generate new components
const component = await finetuningService.generateComponent(
  'Create a responsive navigation bar with dark mode support',
  styleGuide,
  { framework: 'react' }
);
```

#### 5. View in Storybook

```bash
npm run storybook
```

## 📁 File Structure

```
├── services/
│   ├── styleguide-data-mining-service.js       # Extract design data from URLs
│   ├── deepseek-component-finetuning-service.js # AI component generation
│   ├── storybook-component-generator-service.js # Storybook documentation
│   ├── styleguide-to-storybook-orchestrator.js # Workflow orchestration
│   ├── chrome-layers-service.js                 # 3D DOM layer extraction
│   └── visual-style-guide-generator.js          # Visual design extraction
│
├── schemas/
│   └── material-design-3-styleguide-schema.js  # MD3 schema template
│
├── .storybook/
│   ├── main.ts                                  # Storybook configuration
│   └── preview.ts                               # Storybook preview settings
│
├── src/
│   ├── components/generated/                    # Generated components
│   └── stories/
│       ├── generated/                           # Generated stories
│       └── docs/                                # Generated documentation
│
├── training-data/
│   └── components/                              # Training data for fine-tuning
│
├── output/
│   └── styleguides/                             # Extracted style guides
│
└── demo-styleguide-generator.js                 # Complete demo script
```

## 🎨 Material Design 3 Schema

The system includes a comprehensive Material Design 3 schema template:

**File**: `schemas/material-design-3-styleguide-schema.js`

Includes:
- Complete color system (13 tonal palettes)
- Typography scale (15 semantic roles)
- Spacing system (8px grid)
- Elevation levels (0-5)
- Shape system (border radius)
- Motion system (durations and easings)
- State layers
- Component specifications
- Accessibility guidelines

## 📖 Storybook Integration

### Configuration

The Storybook is configured with:
- **Addons**:
  - `@storybook/addon-docs` - Auto-generated documentation
  - `@storybook/addon-essentials` - Essential Storybook features
  - `@storybook/addon-interactions` - Interaction testing
  - `@storybook/addon-a11y` - Accessibility testing

- **Theme**: Customized with LightDom dark theme
- **Auto-docs**: Automatic documentation generation
- **Controls**: Interactive prop controls

### Generated Stories

Each component gets:
1. **Default story** - Basic component render
2. **Variant stories** - One for each variant
3. **Size stories** - sm, md, lg sizes
4. **State stories** - hover, focus, disabled, etc.
5. **Interactive tests** - Automated interaction testing

### Documentation

Each component gets MDX documentation with:
- Overview and description
- Props documentation
- Variants and states
- Accessibility information
- Usage examples
- All stories

## 🤖 DeepSeek Fine-tuning

### Training Data Format

Training data is in JSONL format (one JSON per line):

```json
{
  "instruction": "Generate a Button component based on the following style guide",
  "input": "{\"component\":\"Button\",\"styleGuide\":{...}}",
  "output": "import React from 'react';\n\nexport const Button = ..."
}
```

### Fine-tuning Process

1. **Collect Training Data**:
   - From style guides
   - From existing components
   - From Storybook stories

2. **Prepare Data**:
   ```javascript
   await finetuningService.saveTrainingData('training.jsonl');
   ```

3. **Upload to DeepSeek**:
   - Via DeepSeek API
   - Wait for processing

4. **Fine-tune Model**:
   ```javascript
   const model = await finetuningService.fineTuneModel(trainingDataPath);
   ```

5. **Use Fine-tuned Model**:
   ```javascript
   const component = await finetuningService.generateComponent(
     prompt,
     styleGuide,
     { model: model.id }
   );
   ```

## 🔧 Advanced Features

### Multi-URL Mining

Mine multiple design systems and merge them:

```javascript
const mergedStyleGuide = await orchestrator.mineMultipleUrls([
  'https://material.io',
  'https://ant.design',
  'https://chakra-ui.com'
], {
  name: 'Unified Design System'
});
```

### Custom Component Templates

Create custom templates for component generation:

```javascript
const customTemplate = {
  component: 'CustomButton',
  variants: ['primary', 'secondary', 'ghost'],
  states: ['default', 'hover', 'active', 'disabled'],
  framework: 'react'
};

const component = await finetuningService.generateComponent(
  'Generate custom button',
  styleGuide,
  { template: customTemplate }
);
```

### Framework-Specific Generation

Generate components for different frameworks:

```javascript
// React
const reactComponent = await service.generateComponent(prompt, styleGuide, {
  framework: 'react'
});

// Vue
const vueComponent = await service.generateComponent(prompt, styleGuide, {
  framework: 'vue'
});

// Angular
const angularComponent = await service.generateComponent(prompt, styleGuide, {
  framework: 'angular'
});
```

### 3D DOM Layer Extraction

Extract visual design data using Chrome DevTools Protocol:

```javascript
import { ChromeLayersService } from './services/chrome-layers-service.js';

const layersService = new ChromeLayersService();
await layersService.initialize();

const layerData = await layersService.analyzeLayersForUrl(url, {
  extractColors: true,
  extractTypography: true,
  extractSpacing: true
});
```

## 📊 Output Examples

### Generated Component

```tsx
import React from 'react';

interface ButtonProps {
  variant?: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'md',
  disabled = false,
  children
}) => {
  return (
    <button 
      className={`button button--${variant} button--${size}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### Generated Storybook Story

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['elevated', 'filled', 'tonal', 'outlined', 'text']
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: 'filled',
    children: 'Button'
  }
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: 'Elevated Button'
  }
};
```

### Design Tokens (CSS)

```css
:root {
  /* Primary Colors */
  --color-primary-0: #000000;
  --color-primary-10: #21005E;
  --color-primary-40: #6750A4;
  --color-primary-90: #EADDFF;
  --color-primary-100: #FFFFFF;
  
  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-4: 16px;
  --spacing-8: 32px;
  
  /* Typography */
  --font-family-primary: 'Roboto', sans-serif;
  --font-size-display-large: 57px;
  --font-size-headline-large: 32px;
  --font-size-body-large: 16px;
}
```

## 🧪 Testing

The system includes comprehensive testing:

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Component tests
npm run test:components

# Accessibility tests (in Storybook)
npm run storybook
# Then navigate to any component and check the Accessibility tab
```

## 🔐 Environment Variables

```bash
# DeepSeek API
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# Chrome DevTools Protocol
CHROME_REMOTE_DEBUG_PORT=9222

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Output directories (optional)
OUTPUT_DIR=./output
COMPONENTS_DIR=./src/components/generated
STORIES_DIR=./src/stories/generated
```

## 📚 Additional Resources

- **Material Design 3**: https://m3.material.io
- **Storybook Documentation**: https://storybook.js.org
- **DeepSeek API**: https://platform.deepseek.com
- **Chrome DevTools Protocol**: https://chromedevtools.github.io/devtools-protocol/

## 🤝 Contributing

Contributions are welcome! This system is designed to be extensible:

1. **Add new component patterns** in `styleguide-data-mining-service.js`
2. **Create custom schemas** in `schemas/`
3. **Add framework support** in `deepseek-component-finetuning-service.js`
4. **Enhance Storybook templates** in `storybook-component-generator-service.js`

## 📄 License

See LICENSE file in the repository root.

---

**Generated with ❤️ by LightDom Style Guide & Component Generation System**
