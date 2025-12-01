/**
 * Storybook Stories for ModelfileEditor Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ConfigProvider } from 'antd';
import ModelfileEditor from '../../components/ollama/ModelfileEditor';

const meta: Meta<typeof ModelfileEditor> = {
  title: 'Ollama/ModelfileEditor',
  component: ModelfileEditor,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ConfigProvider>
        <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Modelfile Editor

A syntax-highlighted editor for creating and editing Ollama Modelfiles.

## Features

### Syntax Highlighting
- Instructions (FROM, PARAMETER, SYSTEM, etc.) highlighted in purple
- Parameters highlighted in yellow
- Values highlighted in green
- Comments highlighted in gray
- Multi-line strings properly handled

### Real-time Validation
- Validates Modelfile syntax as you type
- Checks for required FROM instruction
- Validates parameter names against known parameters
- Shows errors and warnings with line numbers

### Instruction Assistance
- Insert common instructions via dropdown
- Add parameters with proper syntax
- Built-in help reference for all instructions
- Snippet insertion at cursor position

### File Operations
- Save Modelfile content
- Copy to clipboard
- Download as file
- Upload existing Modelfile

## Supported Instructions

| Instruction | Description |
|-------------|-------------|
| FROM | Defines the base model (required) |
| PARAMETER | Sets model parameters |
| TEMPLATE | Custom prompt template |
| SYSTEM | System message for AI behavior |
| ADAPTER | LoRA adapter path |
| LICENSE | Model license text |
| MESSAGE | Conversation history messages |

## Usage

\`\`\`tsx
import { ModelfileEditor } from './components/ollama';

function App() {
  return (
    <ModelfileEditor
      initialContent="FROM llama2:7b"
      onSave={(content) => console.log('Saved:', content)}
      onChange={(content) => console.log('Changed:', content)}
    />
  );
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ModelfileEditor>;

/**
 * Empty editor for creating a new Modelfile
 */
export const Empty: Story = {
  args: {
    initialContent: '',
    onSave: (content) => console.log('Saved:', content),
  },
};

/**
 * Editor with a basic Modelfile
 */
export const BasicModelfile: Story = {
  args: {
    initialContent: `FROM llama2:7b

# Set inference parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40

# Define system behavior
SYSTEM """You are a helpful AI assistant. Be concise and accurate."""`,
    onSave: (content) => console.log('Saved:', content),
  },
};

/**
 * Editor with a complete Modelfile including template
 */
export const CompleteModelfile: Story = {
  args: {
    initialContent: `FROM mistral:7b

# Model parameters
PARAMETER temperature 0.8
PARAMETER top_p 0.95
PARAMETER top_k 50
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 4096
PARAMETER num_predict 512

# System prompt
SYSTEM """You are a helpful, harmless, and honest AI assistant.
Your goal is to provide accurate, helpful responses while being 
respectful and considerate. If you're unsure about something, 
say so rather than making up information."""

# Custom template
TEMPLATE """{{ if .System }}{{ .System }}

{{ end }}{{ if .Prompt }}User: {{ .Prompt }}
{{ end }}Assistant: """

# License
LICENSE """MIT License"""`,
    onSave: (content) => console.log('Saved:', content),
  },
  parameters: {
    docs: {
      description: {
        story: 'A complete Modelfile with all common instructions: FROM, PARAMETER, SYSTEM, TEMPLATE, and LICENSE.',
      },
    },
  },
};

/**
 * Editor with code-focused Modelfile
 */
export const CodeAssistantModelfile: Story = {
  args: {
    initialContent: `FROM deepseek-coder:6.7b

# Optimized for code generation
PARAMETER temperature 0.2
PARAMETER top_p 0.8
PARAMETER top_k 30
PARAMETER repeat_penalty 1.15
PARAMETER num_ctx 8192
PARAMETER num_predict 1024

SYSTEM """You are an expert software engineer specializing in:
- Clean, maintainable code
- Best practices and design patterns
- Comprehensive error handling
- Clear documentation

When writing code:
1. Always include helpful comments
2. Follow language-specific conventions
3. Consider edge cases
4. Suggest optimizations when appropriate"""`,
    onSave: (content) => console.log('Saved:', content),
  },
  parameters: {
    docs: {
      description: {
        story: 'A Modelfile configured for code generation with DeepSeek Coder model.',
      },
    },
  },
};

/**
 * Read-only mode for viewing Modelfiles
 */
export const ReadOnly: Story = {
  args: {
    initialContent: `FROM llama2:7b
PARAMETER temperature 0.7
SYSTEM """You are a helpful assistant."""`,
    readOnly: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only mode prevents editing, useful for viewing existing Modelfiles.',
      },
    },
  },
};

/**
 * Editor with validation errors
 */
export const WithErrors: Story = {
  args: {
    initialContent: `# This Modelfile has errors

PARAMETER temperature high
UNKNOWN_INSTRUCTION test
PARAMETER unknownparam 1.0`,
    autoValidate: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows validation errors for invalid syntax, unknown instructions, and missing FROM.',
      },
    },
  },
};

/**
 * Editor without line numbers
 */
export const NoLineNumbers: Story = {
  args: {
    initialContent: `FROM phi:2.7b
PARAMETER temperature 0.5
SYSTEM """A concise, fast assistant."""`,
    showLineNumbers: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor without line numbers for a cleaner look.',
      },
    },
  },
};

/**
 * Compact height editor
 */
export const CompactHeight: Story = {
  args: {
    initialContent: `FROM llama2:7b
PARAMETER temperature 0.7`,
    height: 200,
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor with reduced height for smaller layouts.',
      },
    },
  },
};

/**
 * Interactive story with all callbacks
 */
export const Interactive: Story = {
  args: {
    initialContent: '',
    onSave: (content) => {
      console.log('=== SAVED ===');
      console.log(content);
      alert('Modelfile saved! Check console for content.');
    },
    onChange: (content) => {
      console.log('Content changed, length:', content.length);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive editor with save and change callbacks.',
      },
    },
  },
};
