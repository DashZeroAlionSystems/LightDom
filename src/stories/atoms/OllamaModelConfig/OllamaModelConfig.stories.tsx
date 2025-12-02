import type { Meta, StoryObj } from '@storybook/react';
import { OllamaModelConfig } from '../../../components/atoms/OllamaModelConfig/OllamaModelConfig';

const meta: Meta<typeof OllamaModelConfig> = {
  title: 'Atoms/OllamaModelConfig',
  component: OllamaModelConfig,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# OllamaModelConfig Component

A configuration component for Ollama Modelfile parameters. This component allows users to configure and create custom Ollama models for the LightDom platform.

## Features

- **Model Configuration**: Set model name and base parameters
- **Generation Settings**: Temperature, top-p, top-k controls
- **Context Management**: Configure context window size
- **System Prompt**: Define AI personality and capabilities
- **Advanced Options**: Repeat penalty, max tokens, stop sequences
- **Modelfile Generation**: Automatically generates valid Modelfile content

## Usage

\`\`\`tsx
import { OllamaModelConfig } from '@/components/atoms/OllamaModelConfig';

function MyComponent() {
  const handleChange = (config) => {
    console.log('Config updated:', config);
  };

  const handleCreate = (modelName, modelfile) => {
    console.log('Creating model:', modelName);
    console.log('Modelfile:', modelfile);
  };

  return (
    <OllamaModelConfig
      model="lightdom-deepseek"
      temperature={0.7}
      onChange={handleChange}
      onCreate={handleCreate}
    />
  );
}
\`\`\`

## Integration with Ollama CLI

After configuring, run:
\`\`\`bash
npm run ollama:create-model
\`\`\`

Or manually:
\`\`\`bash
ollama create <model-name> -f Modelfile
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact', 'detailed'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Component size',
    },
    temperature: {
      control: { type: 'range', min: 0, max: 2, step: 0.1 },
      description: 'Generation temperature (0-2)',
    },
    topP: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Top-p sampling (0-1)',
    },
    numCtx: {
      control: 'select',
      options: [2048, 4096, 8192, 16384, 32768],
      description: 'Context window size',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    showAdvanced: {
      control: 'boolean',
      description: 'Show advanced options by default',
    },
  },
};

export default meta;
type Story = StoryObj<typeof OllamaModelConfig>;

// Default story
export const Default: Story = {
  args: {
    model: 'lightdom-deepseek',
    temperature: 0.7,
    topP: 0.9,
    numCtx: 16384,
    systemPrompt: 'You are LightDom AI, an expert assistant for the LightDom platform.',
  },
};

// Compact variant
export const Compact: Story = {
  args: {
    ...Default.args,
    variant: 'compact',
    size: 'sm',
  },
};

// Detailed variant
export const Detailed: Story = {
  args: {
    ...Default.args,
    variant: 'detailed',
    size: 'lg',
    showAdvanced: true,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

// High creativity settings
export const HighCreativity: Story = {
  args: {
    model: 'lightdom-creative',
    temperature: 1.2,
    topP: 0.95,
    topK: 60,
    numCtx: 8192,
    systemPrompt: 'You are a creative AI assistant. Be imaginative and exploratory in your responses.',
  },
};

// Precise/deterministic settings
export const Precise: Story = {
  args: {
    model: 'lightdom-precise',
    temperature: 0.2,
    topP: 0.7,
    topK: 20,
    numCtx: 4096,
    systemPrompt: 'You are a precise AI assistant. Provide accurate, factual responses with minimal variation.',
  },
};

// Code generation optimized
export const CodeGeneration: Story = {
  args: {
    model: 'lightdom-coder',
    temperature: 0.4,
    topP: 0.85,
    topK: 40,
    numCtx: 16384,
    systemPrompt: `You are LightDom Coder, an expert coding assistant.
    
## Capabilities
- Write clean, efficient code
- Debug and fix issues
- Explain code concepts
- Follow best practices

## Response Style
- Use code blocks with language annotations
- Include comments for complex logic
- Suggest improvements when relevant`,
  },
};

// With advanced options shown
export const WithAdvancedOptions: Story = {
  args: {
    ...Default.args,
    showAdvanced: true,
    repeatPenalty: 1.2,
    numPredict: 2048,
  },
};

// Interactive with callbacks
export const Interactive: Story = {
  args: {
    ...Default.args,
    onChange: (config) => {
      console.log('Configuration changed:', config);
    },
    onCreate: (modelName, modelfile) => {
      console.log('Model created:', modelName);
      console.log('Modelfile content:', modelfile);
      alert(`Model "${modelName}" would be created with the following Modelfile:\n\n${modelfile}`);
    },
  },
};

// All sizes comparison
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h3 className="text-sm font-semibold mb-2">Small</h3>
        <OllamaModelConfig size="sm" model="small-model" />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Medium (Default)</h3>
        <OllamaModelConfig size="md" model="medium-model" />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Large</h3>
        <OllamaModelConfig size="lg" model="large-model" />
      </div>
    </div>
  ),
};

// All variants comparison
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h3 className="text-sm font-semibold mb-2">Default</h3>
        <OllamaModelConfig variant="default" model="default-variant" />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Compact</h3>
        <OllamaModelConfig variant="compact" model="compact-variant" />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Detailed</h3>
        <OllamaModelConfig variant="detailed" model="detailed-variant" />
      </div>
    </div>
  ),
};
