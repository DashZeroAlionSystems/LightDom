import type { Meta, StoryObj } from '@storybook/react';
import { CodebaseSearch } from './CodebaseSearch';
import { within, userEvent, expect } from '@storybook/test';

/**
 * # CodebaseSearch Component
 * 
 * A reusable semantic search component for searching across codebases using 
 * high-quality embeddings from Ollama (mxbai-embed-large model).
 * 
 * ## Features
 * - **Semantic Search**: Find code by meaning, not just keywords
 * - **AI Context Mode**: Get relevant code context for AI prompts
 * - **Model Switching**: Switch between embedding models (mxbai-embed-large, nomic-embed-text, all-minilm)
 * - **Similarity Scores**: Visual indicators of match quality
 * - **Expandable Results**: Click to view full code snippets
 * - **Copy to Clipboard**: Easily copy code or context
 * 
 * ## Usage
 * 
 * ```tsx
 * import { CodebaseSearch } from '@/components/ui/CodebaseSearch';
 * 
 * // Basic usage
 * <CodebaseSearch />
 * 
 * // With callbacks
 * <CodebaseSearch 
 *   onSearchResults={(results) => console.log(results)}
 *   onContextRetrieved={(context, files) => {
 *     // Use context with your AI prompt
 *   }}
 * />
 * 
 * // Minimal version without stats
 * <CodebaseSearch showStats={false} showModelSelector={false} />
 * ```
 * 
 * ## Embedding Models
 * 
 * | Model | Dimensions | Performance | Use Case |
 * |-------|------------|-------------|----------|
 * | mxbai-embed-large ⭐ | 1024 | Slower | Highest quality |
 * | nomic-embed-text | 768 | Fast | General purpose |
 * | all-minilm | 384 | Fastest | Lightweight |
 * 
 * ## API Integration
 * 
 * This component connects to the following API endpoints:
 * - `POST /api/codebase-index/search` - Semantic search
 * - `POST /api/codebase-index/context` - AI context retrieval
 * - `GET /api/codebase-index/models` - List embedding models
 * - `POST /api/codebase-index/model` - Switch model
 * - `GET /api/codebase-index/stats` - Index statistics
 */
const meta: Meta<typeof CodebaseSearch> = {
  title: 'Components/AI/CodebaseSearch',
  component: CodebaseSearch,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The CodebaseSearch component provides a semantic search interface for finding code
across your entire codebase using high-quality embeddings.

### Key Benefits
- **Find by meaning**: Unlike keyword search, semantic search understands code intent
- **AI integration**: Get pre-formatted context for AI prompts
- **Multiple models**: Choose between quality and speed with different embedding models
        `,
      },
    },
  },
  argTypes: {
    showModelSelector: {
      control: 'boolean',
      description: 'Show the embedding model selector in advanced options',
    },
    showStats: {
      control: 'boolean',
      description: 'Show index statistics (files, chunks, model)',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    defaultTopK: {
      control: { type: 'number', min: 1, max: 50 },
      description: 'Default number of results to return',
    },
    defaultThreshold: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 },
      description: 'Default similarity threshold (0-1)',
    },
    onSearchResults: {
      action: 'searchResults',
      description: 'Callback when search results are returned',
    },
    onContextRetrieved: {
      action: 'contextRetrieved',
      description: 'Callback when AI context is retrieved',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CodebaseSearch>;

/**
 * Default configuration with all features enabled.
 * Shows stats, model selector, and search functionality.
 */
export const Default: Story = {
  args: {
    showModelSelector: true,
    showStats: true,
    placeholder: 'Search codebase semantically...',
    defaultTopK: 10,
    defaultThreshold: 0.5,
  },
};

/**
 * Compact version without statistics header.
 * Useful for embedding in smaller spaces.
 */
export const Compact: Story = {
  args: {
    showModelSelector: false,
    showStats: false,
    placeholder: 'Quick search...',
  },
};

/**
 * Custom placeholder for specific use cases.
 */
export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Find authentication code...',
    defaultTopK: 5,
  },
};

/**
 * High precision search with lower threshold.
 * Returns more results with lower similarity.
 */
export const HighPrecision: Story = {
  args: {
    defaultThreshold: 0.7,
    defaultTopK: 5,
    placeholder: 'High precision search...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses a higher similarity threshold (0.7) for more precise results.',
      },
    },
  },
};

/**
 * Wide search with lower threshold.
 * Returns more results including those with lower similarity.
 */
export const WideSearch: Story = {
  args: {
    defaultThreshold: 0.3,
    defaultTopK: 20,
    placeholder: 'Broad search...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses a lower similarity threshold (0.3) for broader results.',
      },
    },
  },
};

/**
 * For AI prompt building - focuses on context retrieval.
 */
export const ForAIContext: Story = {
  args: {
    placeholder: 'Describe what you need context for...',
    defaultTopK: 5,
  },
  parameters: {
    docs: {
      description: {
        story: `
Use this configuration when you need to get code context for AI prompts.
Click "AI Context" mode to retrieve formatted context that can be injected into AI prompts.
        `,
      },
    },
  },
};

/**
 * Interactive example with play function for testing.
 */
export const Interactive: Story = {
  args: {
    placeholder: 'Try searching for "authentication"...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find the search input
    const searchInput = canvas.getByPlaceholderText('Try searching for "authentication"...');
    
    // Type a search query
    await userEvent.type(searchInput, 'user authentication', { delay: 50 });
    
    // The search button should now be enabled
    const searchButton = canvas.getByRole('button', { name: /search/i });
    expect(searchButton).not.toBeDisabled();
  },
};

/**
 * Dark theme example (inherits from parent theme).
 */
export const DarkTheme: Story = {
  args: {
    showStats: true,
    showModelSelector: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
