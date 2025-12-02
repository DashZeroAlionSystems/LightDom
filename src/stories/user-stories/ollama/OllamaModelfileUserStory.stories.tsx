import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { OllamaModelConfig } from '../../../components/atoms/OllamaModelConfig';

const meta: Meta = {
  title: 'User Stories/Ollama Modelfile Configuration',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Ollama Modelfile Configuration - User Story

## Overview

The Ollama Modelfile Configuration feature enables users to create custom AI models tailored for the LightDom platform. This integrates Ollama's Modelfile system with the frontend, allowing visual configuration of model parameters.

---

## Epic: Custom AI Model Configuration

### User Story 1: Configure Model Parameters

**As a** LightDom developer  
**I want to** configure Ollama model parameters through a UI  
**So that** I can create custom models without writing Modelfiles manually

#### Acceptance Criteria
- ✅ UI displays all key Modelfile parameters
- ✅ Temperature slider with visual feedback (0.0-2.0)
- ✅ Context size selection (2K-32K tokens)
- ✅ System prompt text area for personality definition
- ✅ Changes are reflected in real-time

---

### User Story 2: Create Custom Model

**As a** LightDom administrator  
**I want to** generate and create a custom Ollama model  
**So that** the platform uses an AI tailored to our needs

#### Acceptance Criteria
- ✅ "Create Model" button generates valid Modelfile content
- ✅ Model name is customizable
- ✅ Generated Modelfile includes all configured parameters
- ✅ Callback provides Modelfile content for CLI or API usage

---

### User Story 3: Advanced Parameter Tuning

**As an** AI engineer  
**I want to** access advanced model parameters  
**So that** I can fine-tune model behavior for specific use cases

#### Acceptance Criteria
- ✅ Collapsible advanced options section
- ✅ Top-P (nucleus sampling) configuration
- ✅ Top-K token selection
- ✅ Repeat penalty settings
- ✅ Max tokens/prediction limit

---

### User Story 4: Model Presets

**As a** user  
**I want to** choose from pre-configured model presets  
**So that** I can quickly set up models for common use cases

#### Preset Options
- **Default**: Balanced settings for general use
- **High Creativity**: Higher temperature for creative tasks
- **Precise**: Lower temperature for factual responses
- **Code Generation**: Optimized for code-related tasks

---

## Technical Architecture

### Component Hierarchy

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                    Ollama Model Configuration                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  OllamaModelConfig                         │   │
│  │  ┌────────────────┐  ┌────────────────┐                   │   │
│  │  │  Model Name    │  │  Temperature   │                   │   │
│  │  │  Input Field   │  │  Slider        │                   │   │
│  │  └────────────────┘  └────────────────┘                   │   │
│  │  ┌────────────────┐  ┌────────────────┐                   │   │
│  │  │  Context Size  │  │  System Prompt │                   │   │
│  │  │  Dropdown      │  │  Textarea      │                   │   │
│  │  └────────────────┘  └────────────────┘                   │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │              Advanced Options (Collapsible)          │ │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │   │
│  │  │  │  Top-P   │ │  Top-K   │ │ Repeat   │ │  Max     │ │ │   │
│  │  │  │  Slider  │ │  Input   │ │ Penalty  │ │ Tokens   │ │ │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │  [Reset]                        [Create Model]        │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Generated Modelfile Output                    │   │
│  │  • FROM deepseek-r1:14b                                   │   │
│  │  • PARAMETER temperature 0.7                               │   │
│  │  • PARAMETER num_ctx 16384                                 │   │
│  │  • SYSTEM "..."                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### Integration Points

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as OllamaModelConfig
    participant G as generateModelfile()
    participant O as Ollama CLI
    participant M as Custom Model

    U->>C: Configure parameters
    C->>C: Update internal state
    U->>C: Click "Create Model"
    C->>G: Generate Modelfile content
    G->>C: Return Modelfile string
    C->>U: Display/callback Modelfile
    U->>O: ollama create <name> -f Modelfile
    O->>M: Create custom model
    M->>U: Model ready for use
\`\`\`

---

## Modelfile Parameters Reference

### Generation Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| \`temperature\` | 0.0-2.0 | 0.7 | Controls randomness |
| \`top_p\` | 0.0-1.0 | 0.9 | Nucleus sampling threshold |
| \`top_k\` | 1-100 | 40 | Top-k token selection |
| \`repeat_penalty\` | 0.0-2.0 | 1.1 | Penalty for repetition |

### Context Parameters

| Parameter | Options | Default | Description |
|-----------|---------|---------|-------------|
| \`num_ctx\` | 2K-32K | 16K | Context window size |
| \`num_predict\` | -1 to 128K | -1 | Max tokens (-1 = unlimited) |

---

## Files Created

### Frontend Components
- \`src/components/atoms/OllamaModelConfig/OllamaModelConfig.tsx\`
- \`src/components/atoms/OllamaModelConfig/OllamaModelConfig.types.ts\`
- \`src/components/atoms/OllamaModelConfig/index.ts\`

### Storybook Stories
- \`src/stories/atoms/OllamaModelConfig/OllamaModelConfig.stories.tsx\`
- \`src/stories/user-stories/ollama/OllamaModelfileUserStory.stories.tsx\`

### Backend/CLI
- \`config/ollama/Modelfile.lightdom-deepseek\`
- \`config/ollama/Modelfile.lightdom-deepseek-lite\`
- \`test-ollama-tool-calling.js\`

---

## Usage Examples

### Basic Usage

\`\`\`tsx
import { OllamaModelConfig } from '@/components/atoms/OllamaModelConfig';

<OllamaModelConfig
  model="my-custom-model"
  temperature={0.7}
  onChange={(config) => console.log(config)}
  onCreate={(name, modelfile) => {
    // Save or execute the modelfile
  }}
/>
\`\`\`

### With Presets

\`\`\`tsx
// Code generation preset
<OllamaModelConfig
  model="lightdom-coder"
  temperature={0.4}
  topP={0.85}
  numCtx={16384}
  systemPrompt="You are an expert coding assistant..."
/>
\`\`\`

### CLI Integration

After configuring via UI:

\`\`\`bash
# Create the model
npm run ollama:create-model

# Test tool calling
npm run ollama:test-tools

# Use the model
ollama run lightdom-deepseek
\`\`\`

---

## Design System Integration

The component follows the LightDom design system:

- **Colors**: Uses surface, primary, and on-surface tokens
- **Spacing**: Consistent padding and margins
- **Typography**: Label and input sizing variants
- **Interactions**: Hover states, focus rings, disabled states
- **Accessibility**: Proper labels, keyboard navigation

---

## API Endpoints (Optional Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/ollama/models\` | List available models |
| POST | \`/api/ollama/create\` | Create model from Modelfile |
| GET | \`/api/ollama/config/:model\` | Get model configuration |
| PUT | \`/api/ollama/config/:model\` | Update model configuration |

        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

// Documentation placeholder
export const Documentation: Story = {
  render: () => (
    <div className="prose max-w-none dark:prose-invert">
      <h1>Ollama Modelfile Configuration</h1>
      <p className="text-lg text-on-surface-variant">
        This user story documents the complete Ollama Modelfile configuration system
        for the LightDom platform.
      </p>
      <p>
        See the <strong>Docs</strong> tab above for the complete documentation.
      </p>
      <div className="mt-8">
        <OllamaModelConfig
          model="lightdom-deepseek"
          temperature={0.7}
          topP={0.9}
          numCtx={16384}
          systemPrompt="You are LightDom AI, an expert assistant for the LightDom platform."
          onChange={(config) => console.log('Config changed:', config)}
          onCreate={(name, modelfile) => {
            console.log('Model created:', name);
            alert(`Model "${name}" configuration:\n\n${modelfile}`);
          }}
        />
      </div>
    </div>
  ),
};

// Interactive Demo
export const InteractiveDemo: Story = {
  render: () => {
    const [lastConfig, setLastConfig] = React.useState<string>('');
    
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Interactive Demo</h2>
        <p className="text-on-surface-variant mb-6">
          Configure the model parameters and click "Create Model" to see the generated Modelfile.
        </p>
        <OllamaModelConfig
          model="demo-model"
          showAdvanced={true}
          onChange={(config) => {
            setLastConfig(JSON.stringify(config, null, 2));
          }}
          onCreate={(name, modelfile) => {
            setLastConfig(modelfile);
          }}
        />
        {lastConfig && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Output</h3>
            <pre className="bg-surface-container p-4 rounded-lg text-sm overflow-auto max-h-64">
              {lastConfig}
            </pre>
          </div>
        )}
      </div>
    );
  },
};
