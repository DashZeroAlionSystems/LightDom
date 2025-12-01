/**
 * Storybook Stories for SystemPromptEditor Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ConfigProvider } from 'antd';
import SystemPromptEditor from '../../components/ollama/SystemPromptEditor';

const meta: Meta<typeof SystemPromptEditor> = {
  title: 'Ollama/SystemPromptEditor',
  component: SystemPromptEditor,
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
# System Prompt Editor

A rich editor for customizing AI behavior through system prompts.

## Features

### Prompt Editor
- Large textarea with character count
- Real-time quality analysis
- Visual feedback on prompt elements
- Syntax suggestions

### Template Library
- Pre-built system prompt templates
- Categorized by use case (General, Technical, Creative, Education, Style)
- Favorite templates for quick access
- One-click template application

### Quality Analysis
- Character and word count
- Quality score (0-100%)
- Detected elements: role definition, examples, constraints, format rules
- Warnings and suggestions for improvement

### Additional Features
- Variable insertion ({{user_name}}, {{date}}, etc.)
- Prompt history with restore capability
- Test prompt with AI (when callback provided)
- Copy to clipboard
- Best practices guide

## Template Categories

| Category | Examples |
|----------|----------|
| General | Helpful Assistant |
| Technical | Code Expert, Data Analyst, JSON Only |
| Creative | Creative Writer |
| Education | Patient Teacher, Socratic Guide |
| Style | Concise Responder |

## Usage

\`\`\`tsx
import { SystemPromptEditor } from './components/ollama';

function App() {
  return (
    <SystemPromptEditor
      initialPrompt="You are a helpful assistant."
      onSave={(prompt) => console.log('Saved:', prompt)}
      onChange={(prompt) => console.log('Changed:', prompt)}
      onTest={async (prompt) => {
        // Call your AI API to test the prompt
        return "AI response preview";
      }}
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
type Story = StoryObj<typeof SystemPromptEditor>;

/**
 * Empty editor for creating a new system prompt
 */
export const Empty: Story = {
  args: {
    initialPrompt: '',
    onSave: (prompt) => console.log('Saved:', prompt),
  },
};

/**
 * Editor with a basic system prompt
 */
export const BasicPrompt: Story = {
  args: {
    initialPrompt: 'You are a helpful AI assistant. Be concise and accurate in your responses.',
    onSave: (prompt) => console.log('Saved:', prompt),
  },
};

/**
 * Editor with a detailed system prompt
 */
export const DetailedPrompt: Story = {
  args: {
    initialPrompt: `You are a helpful, harmless, and honest AI assistant. Your goal is to provide accurate, helpful responses while being respectful and considerate.

Guidelines:
- Always prioritize user safety and well-being
- If you're unsure about something, say so rather than making up information
- Provide sources or reasoning when making claims
- Be concise but thorough

When responding to questions:
1. First, understand what the user is really asking
2. Provide a direct answer
3. Offer additional context if helpful
4. Suggest follow-up questions if appropriate`,
    onSave: (prompt) => console.log('Saved:', prompt),
  },
  parameters: {
    docs: {
      description: {
        story: 'A detailed system prompt with guidelines and structured instructions.',
      },
    },
  },
};

/**
 * Code-focused system prompt
 */
export const CodeExpert: Story = {
  args: {
    initialPrompt: `You are an expert software engineer with deep knowledge of multiple programming languages, frameworks, and best practices.

When writing code:
- Always include helpful comments
- Follow industry best practices and design patterns
- Consider edge cases and error handling
- Suggest optimizations when appropriate
- Explain your reasoning when making architectural decisions

When reviewing code:
- Be constructive and specific about improvements
- Point out potential bugs or security issues
- Suggest refactoring opportunities
- Praise good patterns when you see them

Languages you specialize in: TypeScript, Python, Go, Rust, Java`,
    onSave: (prompt) => console.log('Saved:', prompt),
  },
  parameters: {
    docs: {
      description: {
        story: 'System prompt configured for code assistance and review.',
      },
    },
  },
};

/**
 * Creative writing system prompt
 */
export const CreativeWriter: Story = {
  args: {
    initialPrompt: `You are a creative writer with a vivid imagination and mastery of various writing styles.

You excel at:
- Crafting engaging narratives with compelling characters
- Using vivid imagery and descriptive language
- Adapting tone and style to match the desired genre
- Creating immersive worlds and settings
- Balancing dialogue, action, and exposition

Let your creativity flow while maintaining coherent and engaging storytelling. When given a prompt, explore multiple angles before settling on an approach.`,
    onSave: (prompt) => console.log('Saved:', prompt),
  },
  parameters: {
    docs: {
      description: {
        story: 'System prompt for creative writing and storytelling.',
      },
    },
  },
};

/**
 * Without template library
 */
export const NoTemplates: Story = {
  args: {
    initialPrompt: 'You are a helpful assistant.',
    showTemplates: false,
    onSave: (prompt) => console.log('Saved:', prompt),
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor without the template library tab.',
      },
    },
  },
};

/**
 * Read-only mode
 */
export const ReadOnly: Story = {
  args: {
    initialPrompt: 'You are a helpful AI assistant. This prompt cannot be edited.',
    readOnly: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only mode for viewing system prompts without editing.',
      },
    },
  },
};

/**
 * With custom length limits
 */
export const CustomLimits: Story = {
  args: {
    initialPrompt: 'Short prompt.',
    maxLength: 500,
    minLength: 50,
    onSave: (prompt) => console.log('Saved:', prompt),
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor with custom minimum (50) and maximum (500) character limits.',
      },
    },
  },
};

/**
 * With test callback for AI preview
 */
export const WithTestCallback: Story = {
  args: {
    initialPrompt: 'You are a helpful assistant that speaks like a pirate.',
    onSave: (prompt) => console.log('Saved:', prompt),
    onTest: async (prompt) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return `Ahoy there, matey! I be ready to help ye with whatever ye need. What be on yer mind today, landlubber?`;
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor with test callback that simulates an AI response preview.',
      },
    },
  },
};

/**
 * JSON-only response format
 */
export const JSONFormat: Story = {
  args: {
    initialPrompt: `You are an API that responds ONLY in valid JSON format.
- Never include any text outside of JSON
- Ensure all output is valid, parseable JSON
- Use consistent key naming conventions (camelCase)
- Include appropriate data types
- Handle errors by returning error objects

Example response format:
{
  "success": true,
  "data": { ... },
  "message": "Operation completed"
}`,
    onSave: (prompt) => console.log('Saved:', prompt),
  },
  parameters: {
    docs: {
      description: {
        story: 'System prompt for structured JSON-only responses.',
      },
    },
  },
};

/**
 * Interactive with all features
 */
export const Interactive: Story = {
  args: {
    initialPrompt: '',
    showTemplates: true,
    onSave: (prompt) => {
      console.log('=== SAVED ===');
      console.log(prompt);
      alert('System prompt saved! Check console for content.');
    },
    onChange: (prompt) => {
      console.log('Prompt changed, length:', prompt.length);
    },
    onTest: async (prompt) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `[AI Response Preview]\n\nBased on your system prompt, the AI would respond in the style and manner you've defined. This is a simulated preview to help you verify the prompt works as expected.`;
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive editor with all features enabled.',
      },
    },
  },
};
