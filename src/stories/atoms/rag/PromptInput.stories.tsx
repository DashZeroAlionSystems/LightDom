import type { Meta, StoryObj } from '@storybook/react';
import { PromptInput, ActionArea, ActionButton, SlashCommand } from '../../../components/ui/PromptInput';
import { Database, Brain, Sparkles, Play, Settings, Search, Download, Zap } from 'lucide-react';

/**
 * # PromptInput Component
 * 
 * Enhanced prompt input with slash commands and action button areas for storybook mining
 * and model training integration.
 * 
 * ## User Story
 * 
 * **As a** developer using the LightDom platform,
 * **I want** to use slash commands in the prompt input,
 * **So that** I can quickly mine storybooks, train models, and manage workflows without leaving the chat interface.
 * 
 * ## Features
 * 
 * - **Slash Commands**: Type `/` to see available commands
 * - **11 Pretrained Models**: Access via `/models` or `/train --model=<name>`
 * - **Action Button Areas**: Configurable button areas (top, bottom, left, right, inline)
 * - **Quick Actions**: Common actions accessible from the toolbar
 * - **Command Palette**: Click the command icon to browse all commands
 * 
 * ## Available Commands
 * 
 * | Command | Description |
 * |---------|-------------|
 * | `/mine` | Mine storybooks for training data |
 * | `/train` | Start training with a pretrained model |
 * | `/models` | List available pretrained models (11 models) |
 * | `/status` | Check training or mining status |
 * | `/help` | Show available commands |
 * | `/search` | Search components or patterns |
 * | `/generate` | Generate component or story |
 * | `/workflow` | Create or manage workflows |
 * | `/config` | View or update configuration |
 * | `/clear` | Clear conversation history |
 * | `/export` | Export training data or components |
 */
const meta: Meta<typeof PromptInput> = {
  title: 'RAG/PromptInput',
  component: PromptInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Enhanced prompt input component with slash commands integration for storybook mining and model training.

## Quick Start

\`\`\`tsx
import { PromptInput } from '@/components/ui/PromptInput';

<PromptInput
  onSend={(value) => console.log('Sent:', value)}
  onCommandExecute={(cmd) => console.log('Command:', cmd)}
  enableSlashCommands={true}
/>
\`\`\`

## Using Commands

Type \`/\` to see the command menu. Available commands include:

- \`/mine\` - Start mining storybooks
- \`/train --model=bert-base-uncased\` - Train with a specific model
- \`/models\` - View all 11 pretrained models
- \`/status\` - Check current status
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    enableSlashCommands: {
      control: 'boolean',
      description: 'Enable slash command support',
    },
    showExamples: {
      control: 'boolean',
      description: 'Show example commands when empty',
    },
    showCommandPalette: {
      control: 'boolean',
      description: 'Show command palette button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PromptInput>;

// Default story
export const Default: Story = {
  args: {
    enableSlashCommands: true,
    showExamples: true,
    showCommandPalette: true,
    placeholder: 'Type a message or use /commands...',
  },
};

// With slash commands visible
export const WithSlashCommands: Story = {
  args: {
    enableSlashCommands: true,
    showExamples: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Type `/` to see the command dropdown menu with all available commands.',
      },
    },
  },
};

// Loading state
export const Loading: Story = {
  args: {
    loading: true,
    enableSlashCommands: true,
  },
};

// With quick actions
export const WithQuickActions: Story = {
  args: {
    enableSlashCommands: true,
    quickActions: [
      { id: 'mine', label: 'Mine', icon: <Database className="h-4 w-4" />, tooltip: 'Start mining' },
      { id: 'train', label: 'Train', icon: <Brain className="h-4 w-4" />, tooltip: 'Start training' },
      { id: 'models', label: 'Models', icon: <Sparkles className="h-4 w-4" />, tooltip: 'View models' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Quick action buttons appear in the toolbar for common operations.',
      },
    },
  },
};

// With action areas
export const WithActionAreas: Story = {
  args: {
    enableSlashCommands: true,
    actionAreas: [
      {
        id: 'top-actions',
        position: 'top',
        layout: 'horizontal',
        buttons: [
          { id: 'new-workflow', label: 'New Workflow', icon: <Play className="h-4 w-4" />, variant: 'primary' },
          { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, variant: 'outline' },
        ],
      },
      {
        id: 'bottom-actions',
        position: 'bottom',
        layout: 'horizontal',
        buttons: [
          { id: 'search', label: 'Search Components', icon: <Search className="h-4 w-4" />, variant: 'ghost' },
          { id: 'export', label: 'Export Data', icon: <Download className="h-4 w-4" />, variant: 'ghost' },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Action areas can be positioned around the input for contextual actions.',
      },
    },
  },
};

// Full featured with all options
export const FullFeatured: Story = {
  args: {
    enableSlashCommands: true,
    showExamples: true,
    showCommandPalette: true,
    supportedModels: ['deepseek-r1', 'gpt-4', 'claude-3', 'llama-3'],
    quickActions: [
      { id: 'mine', label: 'Mine', icon: <Database className="h-4 w-4" />, tooltip: 'Start storybook mining', onClick: () => alert('Mining started!') },
      { id: 'train', label: 'Train', icon: <Brain className="h-4 w-4" />, tooltip: 'Start model training', onClick: () => alert('Training dialog') },
      { id: 'models', label: 'Models', icon: <Sparkles className="h-4 w-4" />, tooltip: 'View 11 pretrained models' },
    ],
    actionAreas: [
      {
        id: 'inline-actions',
        position: 'inline',
        layout: 'horizontal',
        buttons: [
          { id: 'quick-mine', label: 'Quick Mine', icon: <Zap className="h-4 w-4" />, variant: 'secondary' },
        ],
      },
    ],
    onSend: (value) => console.log('Sent:', value),
    onCommandExecute: (cmd) => console.log('Command executed:', cmd),
    onCommandSelect: (cmd) => console.log('Command selected:', cmd),
  },
  parameters: {
    docs: {
      description: {
        story: 'Full featured prompt input with all options enabled including slash commands, action areas, and quick actions.',
      },
    },
  },
};

// Storybook mining focused
export const StorybookMiningMode: Story = {
  args: {
    enableSlashCommands: true,
    showCommandPalette: true,
    placeholder: 'Mine storybooks or train models. Try /mine or /train...',
    quickActions: [
      { id: 'mine-default', label: 'Mine Default Sites', icon: <Database className="h-4 w-4" />, variant: 'primary' },
      { id: 'mine-custom', label: 'Custom URL', icon: <Search className="h-4 w-4" />, variant: 'outline' },
    ],
    actionAreas: [
      {
        id: 'training-options',
        position: 'top',
        layout: 'horizontal',
        buttons: [
          { id: 'bert', label: 'BERT', icon: <Brain className="h-4 w-4" />, variant: 'outline', tooltip: 'Train with BERT' },
          { id: 'mobilenet', label: 'MobileNet', icon: <Brain className="h-4 w-4" />, variant: 'outline', tooltip: 'Train with MobileNet' },
          { id: 'sentence-encoder', label: 'Sentence Encoder', icon: <Brain className="h-4 w-4" />, variant: 'outline', tooltip: 'Train with Universal Sentence Encoder' },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Configured specifically for storybook mining workflows with quick access to training models.',
      },
    },
  },
};

// Minimal mode
export const Minimal: Story = {
  args: {
    enableSlashCommands: false,
    showExamples: false,
    showCommandPalette: false,
    placeholder: 'Type your message...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal mode without slash commands or examples.',
      },
    },
  },
};
