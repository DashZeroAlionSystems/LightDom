# DeepSeek Command Palette System

VS Code-style hierarchical command palette for DeepSeek AI operations.

## Features

### 🎯 **Hierarchical Navigation**
- **Multi-level command tree** with breadcrumb navigation
- **Category grouping** when not searching (Database, Scraping, Analysis, Git, Workflows, Documents, System)
- **Subcommands** for complex operations (Database → Query/Schema/Suggest)
- **Breadcrumb trail** showing current navigation path

### 🔍 **Fuzzy Search**
- **Smart ranking** based on query match quality
- **Multi-field search** across label, description, keywords, and category
- **Consecutive match bonus** for better relevance
- **Recent commands boost** when not searching

### ⌨️ **Keyboard Navigation**
- **Cmd/Ctrl + K** to open palette globally
- **Arrow Up/Down** to navigate commands
- **Enter** to select/execute command or navigate into subcommands
- **Escape** to go back in hierarchy or close palette
- **Backspace** to navigate back when search is empty
- **Auto-scroll** to keep selected item visible

### 🎨 **Visual Design**
- **Material Design 3** aligned with existing design system
- **Category icons and colors** for quick visual identification
- **Recent command badges** showing frequently used commands
- **Keyboard shortcut hints** in footer
- **Argument input** for commands requiring parameters
- **Loading and empty states**

### 💾 **Persistence**
- **Recent commands** saved to localStorage
- **Max 10 recent commands** automatically managed
- **Command history** persists across sessions

## Installation

```tsx
import { CommandPalette, useCommandPalette, createDefaultCommands } from '@/components/deepseek';
```

## Usage

### Basic Setup

```tsx
import React from 'react';
import { CommandPalette, useCommandPalette, createDefaultCommands } from '@/components/deepseek';

function App() {
  const { open, openPalette, closePalette, recentCommands, saveRecentCommand } = useCommandPalette();
  
  const commands = createDefaultCommands({
    onDatabaseQuery: (query) => console.log('Execute query:', query),
    onDatabaseSchema: () => console.log('Show schema'),
    onCrawlStart: (url, depth) => console.log('Start crawl:', url, depth),
    onGitStatus: () => console.log('Git status'),
    // ... other handlers
  });
  
  const handleCommandExecute = (command, args) => {
    console.log('Command executed:', command.id, args);
    saveRecentCommand(command.id);
  };
  
  return (
    <>
      <button onClick={openPalette}>Open Command Palette (Cmd+K)</button>
      
      <CommandPalette
        commands={commands}
        open={open}
        onClose={closePalette}
        onCommandExecute={handleCommandExecute}
        recentCommands={recentCommands}
      />
    </>
  );
}
```

### Custom Commands

```tsx
import { Command } from '@/components/deepseek';
import { Database, Play } from 'lucide-react';

const customCommands: Command[] = [
  {
    id: 'custom.action',
    label: 'Custom Action',
    description: 'Perform a custom operation',
    category: 'system',
    keywords: ['custom', 'action', 'special'],
    icon: <Play className="w-4 h-4" />,
    handler: async () => {
      // Your custom logic
      await performAction();
    },
    subCommands: [
      {
        id: 'custom.action.advanced',
        label: 'Advanced Mode',
        description: 'Run with advanced options',
        category: 'system',
        keywords: ['advanced', 'expert'],
        requiresArgs: true,
        argPlaceholder: 'Enter parameters...',
        handler: (args) => {
          console.log('Advanced action with args:', args);
        },
      },
    ],
  },
];
```

### Integration with Existing Systems

#### PromptConsolePage Integration

```tsx
import { CommandPalette, useCommandPalette, createDefaultCommands } from '@/components/deepseek';

function PromptConsolePage() {
  const { open, openPalette, closePalette, recentCommands, saveRecentCommand } = useCommandPalette();
  
  // Create commands with existing handlers
  const commands = createDefaultCommands({
    onDatabaseQuery: async (query) => {
      const response = await fetch('/api/deepseek/database/query', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      // Handle response
    },
    onCrawlStart: (url, depth) => {
      // Existing crawler logic
    },
    onGitStatus: async () => {
      const response = await fetch('/api/git/status');
      // Handle response
    },
    // Map to existing slash command handlers
  });
  
  return (
    <div>
      {/* Your existing UI */}
      
      <CommandPalette
        commands={commands}
        open={open}
        onClose={closePalette}
        onCommandExecute={(cmd, args) => {
          saveRecentCommand(cmd.id);
          appendSystemMessage(`Executed: ${cmd.label}`);
        }}
        recentCommands={recentCommands}
      />
    </div>
  );
}
```

## Command Structure

### Command Definition

```typescript
interface Command {
  id: string;                    // Unique identifier (e.g., 'database.query')
  label: string;                 // Display name (e.g., 'Execute Query')
  description: string;           // Help text shown in palette
  category: CommandCategory;     // Grouping category
  keywords: string[];            // Search terms for fuzzy matching
  shortcut?: string;            // Keyboard shortcut (display only)
  icon?: React.ReactNode;       // Icon component
  handler: (args?: string[]) => Promise<void> | void;  // Execute function
  subCommands?: Command[];      // Nested commands
  requiresArgs?: boolean;       // Show argument input
  argPlaceholder?: string;      // Argument input placeholder
}
```

### Categories

- **database**: PostgreSQL queries and schema operations
- **scraping**: Web crawling and styleguide mining
- **analysis**: Data analysis and pattern discovery
- **git**: Version control operations
- **workflows**: Automation and orchestration (N8N-style)
- **system**: Service management and configuration
- **blockchain**: Mining and smart contracts
- **documents**: RAG ingestion and search

## API Reference

### `useCommandPalette()`

Hook for managing command palette state.

**Returns:**
```typescript
{
  open: boolean;                                    // Palette open state
  openPalette: () => void;                         // Open palette
  closePalette: () => void;                        // Close palette
  recentCommands: string[];                        // Recent command IDs
  saveRecentCommand: (commandId: string) => void;  // Add to recent
}
```

### `createDefaultCommands(handlers)`

Factory function for creating default command tree.

**Parameters:**
```typescript
{
  onDatabaseQuery?: (query: string) => void;
  onDatabaseSchema?: () => void;
  onDatabaseSuggest?: (prompt: string) => void;
  onCrawlStart?: (url: string, depth?: number) => void;
  onCrawlStop?: () => void;
  onCrawlStatus?: () => void;
  onStyleguideMine?: (url: string) => void;
  onAnalyzeData?: (type: string) => void;
  onAnalyzePatterns?: () => void;
  onGitStatus?: () => void;
  onGitBranches?: () => void;
  onGitCheckout?: (branch: string) => void;
  onGitPull?: (remote?: string, branch?: string) => void;
  onWorkflowList?: () => void;
  onWorkflowExecute?: (id: string) => void;
  onWorkflowCreate?: () => void;
  onIngestUrl?: (url: string) => void;
  onIngestUpload?: () => void;
  onSearchDocs?: (query: string) => void;
  onServicesList?: () => void;
  onServiceStart?: (id: string) => void;
  onServiceStop?: (id: string) => void;
}
```

### `<CommandPalette />`

**Props:**
```typescript
interface CommandPaletteProps {
  commands: Command[];           // Command tree
  open: boolean;                 // Open state
  onClose: () => void;          // Close handler
  onCommandExecute?: (command: Command, args?: string[]) => void;  // Execute handler
  recentCommands?: string[];    // Recent command IDs
  className?: string;           // Additional CSS classes
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open/close command palette |
| `↑` / `↓` | Navigate up/down |
| `Enter` | Select command or navigate into subcommands |
| `Esc` | Go back in hierarchy or close |
| `Backspace` | Navigate back when search is empty |

## Examples

### Database Operations

1. Press **Cmd+K**
2. Type "database" or navigate to Database category
3. Press **Enter** to explore subcommands:
   - **Execute Query**: Run custom SQL
   - **View Schema**: Show database structure
   - **Natural Language Query**: Convert prompt to SQL

### Web Scraping

1. Press **Cmd+K**
2. Type "crawl" or navigate to Web Scraping
3. Select "Start Crawler"
4. Enter URL and optional depth: `https://example.com --depth 2`
5. Press **Enter** to execute

### Git Operations

1. Press **Cmd+K**
2. Type "git" to see all Git commands
3. Quick access to:
   - Git Status (shows working tree)
   - List Branches
   - Checkout Branch (requires branch name)
   - Pull Changes

## Advanced Features

### Fuzzy Search Algorithm

The search uses a custom fuzzy matching algorithm that:
- **Exact matches** score highest (1000 points)
- **Starts-with matches** score high (900 points)
- **Contains matches** score medium (700 points)
- **Character-by-character** fuzzy matching with consecutive bonus
- **Multi-field search** across label, description, keywords, category

### Recent Commands

Recent commands are:
- Stored in localStorage
- Limited to 10 most recent
- Boosted in search results
- Displayed with "Recent" badge
- Persisted across sessions

### Hierarchical Navigation

- Commands can have unlimited nested subcommands
- Breadcrumb trail shows current path
- Click breadcrumb to jump back to parent level
- Press Escape to navigate back one level
- Back button appears when in subcommand context

## Styling

The command palette uses Material Design 3 tokens:

```css
/* Surface colors */
bg-surface-container-high
bg-surface-container-low

/* Text colors */
text-on-surface
text-on-surface-variant
text-primary

/* Borders */
border-outline/30
border-outline/40

/* Accent colors */
bg-primary/10
text-primary

/* Category colors */
text-blue-400    /* Database */
text-green-400   /* Scraping */
text-purple-400  /* Analysis */
text-orange-400  /* Git */
text-yellow-400  /* Workflows */
text-gray-400    /* System */
text-cyan-400    /* Blockchain */
text-pink-400    /* Documents */
```

## Best Practices

1. **Keep command labels short** (2-4 words)
2. **Use descriptive keywords** for better search
3. **Group related commands** using subcommands
4. **Provide clear descriptions** (shown in palette)
5. **Use consistent icons** from lucide-react
6. **Handle errors gracefully** in command handlers
7. **Show feedback** after command execution
8. **Save recent commands** for better UX

## Migration from Slash Commands

The command palette can replace existing slash commands:

**Before (slash commands):**
```tsx
if (input === '/git status') {
  await handleGitStatus();
}
```

**After (command palette):**
```tsx
const commands = createDefaultCommands({
  onGitStatus: async () => {
    await handleGitStatus();
  },
});
```

Both systems can coexist during migration.

## Future Enhancements

- [ ] Command aliases (multiple labels for same command)
- [ ] Command history with timestamps
- [ ] Command suggestions based on context
- [ ] Command chaining (execute multiple commands)
- [ ] Custom keyboard shortcuts
- [ ] Command macros (save command sequences)
- [ ] AI-powered command suggestions
- [ ] Command analytics and usage tracking

## Troubleshooting

### Commands not appearing in search

- Check that `keywords` includes relevant search terms
- Verify `category` is valid
- Ensure command is in `commands` array

### Recent commands not persisting

- Check browser localStorage permissions
- Verify localStorage is not full
- Check for console errors

### Keyboard shortcuts not working

- Ensure no other component is capturing `Cmd+K`
- Check that palette hook is mounted
- Verify browser allows keyboard events

## License

MIT
