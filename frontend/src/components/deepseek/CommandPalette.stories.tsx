import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommandPalette, createDefaultCommands } from './';
import type { Command } from './CommandPalette';
import { Database, BarChart2, Play } from 'lucide-react';

const meta: Meta<typeof CommandPalette> = {
  title: 'DeepSeek/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'VS Code-style hierarchical command palette with fuzzy search, keyboard navigation, and recent commands tracking.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

// Mock handlers for demo
const mockHandlers = {
  onDatabaseQuery: (query: string) => {
    console.log('Execute query:', query);
    alert(`Executing SQL: ${query}`);
  },
  onDatabaseSchema: () => {
    console.log('Show schema');
    alert('Database Schema:\n\n- users\n- posts\n- comments\n- sessions');
  },
  onDatabaseSuggest: (prompt: string) => {
    console.log('NL query:', prompt);
    alert(`Converting to SQL: ${prompt}\n\nSELECT * FROM users WHERE created_at > NOW() - INTERVAL '7 days'`);
  },
  onCrawlStart: (url: string, depth?: number) => {
    console.log('Start crawl:', url, depth);
    alert(`Starting crawler:\nURL: ${url}\nDepth: ${depth || 1}`);
  },
  onCrawlStop: () => {
    console.log('Stop crawler');
    alert('Stopping all crawlers...');
  },
  onCrawlStatus: () => {
    console.log('Crawler status');
    alert('Crawler Status:\n\n✓ Active: 2\n✓ Pages crawled: 145\n✓ Avg speed: 3.2 pages/sec');
  },
  onStyleguideMine: (url: string) => {
    console.log('Mine styleguide:', url);
    alert(`Mining styleguide from: ${url}\n\nExtracting:\n- Colors\n- Typography\n- Spacing\n- Components`);
  },
  onAnalyzeData: (type: string) => {
    console.log('Analyze data:', type);
    alert(`Analyzing ${type} data...`);
  },
  onAnalyzePatterns: () => {
    console.log('Discover patterns');
    alert('Pattern Discovery:\n\n✓ Found 12 recurring patterns\n✓ 5 component groups\n✓ 3 design systems');
  },
  onGitStatus: () => {
    console.log('Git status');
    alert('Git Status:\n\nOn branch main\nYour branch is up to date\n\nChanges:\n  M src/App.tsx\n  ?? new-file.ts');
  },
  onGitBranches: () => {
    console.log('Git branches');
    alert('Branches:\n\n* main\n  feature/command-palette\n  dev\n  origin/main\n  origin/dev');
  },
  onGitCheckout: (branch: string) => {
    console.log('Git checkout:', branch);
    alert(`Switching to branch: ${branch}`);
  },
  onGitPull: (remote?: string, branch?: string) => {
    console.log('Git pull:', remote, branch);
    alert(`Pulling from ${remote || 'origin'}/${branch || 'main'}...`);
  },
  onWorkflowList: () => {
    console.log('List workflows');
    alert('Workflows:\n\n1. SEO Analysis\n2. Data Mining\n3. Content Generation\n4. Report Builder');
  },
  onWorkflowExecute: (id: string) => {
    console.log('Execute workflow:', id);
    alert(`Executing workflow: ${id}\n\nStarting nodes:\n- Fetch Data\n- Transform\n- Analyze\n- Report`);
  },
  onWorkflowCreate: () => {
    console.log('Create workflow');
    alert('Opening workflow designer...');
  },
  onIngestUrl: (url: string) => {
    console.log('Ingest URL:', url);
    alert(`Ingesting document from: ${url}\n\nProcessing:\n- Download content\n- Extract text\n- Generate embeddings\n- Store in vectorstore`);
  },
  onIngestUpload: () => {
    console.log('Ingest upload');
    alert('Opening file picker...');
  },
  onSearchDocs: (query: string) => {
    console.log('Search docs:', query);
    alert(`Searching documents for: ${query}\n\nFound 8 relevant chunks:\n- Document A (score: 0.92)\n- Document B (score: 0.87)\n- Document C (score: 0.81)`);
  },
  onServicesList: () => {
    console.log('List services');
    alert('Services:\n\n✓ API Server (running)\n✓ Frontend (running)\n✓ PostgreSQL (running)\n○ Redis (stopped)');
  },
  onServiceStart: (id: string) => {
    console.log('Start service:', id);
    alert(`Starting service: ${id}`);
  },
  onServiceStop: (id: string) => {
    console.log('Stop service:', id);
    alert(`Stopping service: ${id}`);
  },
};

// Interactive wrapper component
const InteractiveCommandPalette = ({ commands, recentCommands }: { commands: Command[], recentCommands?: string[] }) => {
  const [open, setOpen] = useState(true);
  const [recent, setRecent] = useState<string[]>(recentCommands || []);

  const handleCommandExecute = (command: Command) => {
    console.log('Command executed:', command.id);
    // Add to recent
    setRecent(prev => [command.id, ...prev.filter(id => id !== command.id)].slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Command Palette Demo</h1>
          <p className="text-text-secondary">Press Cmd/Ctrl + K to open the command palette</p>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-dark transition-colors"
          >
            Open Command Palette
          </button>
        </div>

        <div className="bg-background-secondary rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Recent Commands</h2>
          {recent.length === 0 ? (
            <p className="text-text-tertiary text-sm">No recent commands yet. Execute a command to see it here.</p>
          ) : (
            <ul className="space-y-1">
              {recent.map(id => (
                <li key={id} className="text-sm text-text-secondary font-mono">
                  {id}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <CommandPalette
        commands={commands}
        open={open}
        onClose={() => setOpen(false)}
        onCommandExecute={handleCommandExecute}
        recentCommands={recent}
      />
    </div>
  );
};

/**
 * Default - Full command palette with all categories
 */
export const Default: Story = {
  render: () => {
    const commands = createDefaultCommands(mockHandlers);
    return <InteractiveCommandPalette commands={commands} />;
  },
};

/**
 * WithRecentCommands - Shows recent command tracking
 */
export const WithRecentCommands: Story = {
  render: () => {
    const commands = createDefaultCommands(mockHandlers);
    const recentCommands = [
      'database.query',
      'git.status',
      'scraping.crawl.start',
      'database.schema',
      'workflows.list',
    ];
    return <InteractiveCommandPalette commands={commands} recentCommands={recentCommands} />;
  },
};

/**
 * DatabaseCommands - Database operations only
 */
export const DatabaseCommands: Story = {
  render: () => {
    const commands = createDefaultCommands(mockHandlers).filter(cmd => cmd.category === 'database');
    return <InteractiveCommandPalette commands={commands} />;
  },
};

/**
 * CustomCommands - Custom command definitions
 */
export const CustomCommands: Story = {
  render: () => {
    const customCommands: Command[] = [
      {
        id: 'custom.hello',
        label: 'Say Hello',
        description: 'Display a greeting message',
        category: 'system',
        keywords: ['hello', 'greeting', 'welcome'],
        icon: <Play className="w-4 h-4" />,
        handler: () => alert('Hello, World!'),
      },
      {
        id: 'custom.theme',
        label: 'Theme Settings',
        description: 'Customize application theme',
        category: 'system',
        keywords: ['theme', 'appearance', 'colors'],
        icon: <BarChart2 className="w-4 h-4" />,
        handler: () => {},
        subCommands: [
          {
            id: 'custom.theme.dark',
            label: 'Dark Mode',
            description: 'Switch to dark theme',
            category: 'system',
            keywords: ['dark', 'night'],
            handler: () => alert('Switching to dark mode...'),
          },
          {
            id: 'custom.theme.light',
            label: 'Light Mode',
            description: 'Switch to light theme',
            category: 'system',
            keywords: ['light', 'day'],
            handler: () => alert('Switching to light mode...'),
          },
        ],
      },
    ];

    return <InteractiveCommandPalette commands={customCommands} />;
  },
};

/**
 * WithArgumentsRequired - Commands that need user input
 */
export const WithArgumentsRequired: Story = {
  render: () => {
    const commands: Command[] = [
      {
        id: 'search',
        label: 'Search',
        description: 'Search for items',
        category: 'database',
        keywords: ['search', 'find', 'query'],
        icon: <Database className="w-4 h-4" />,
        requiresArgs: true,
        argPlaceholder: 'Enter search query...',
        handler: (args) => {
          if (args && args.length > 0) {
            alert(`Searching for: ${args.join(' ')}`);
          }
        },
      },
      {
        id: 'create.user',
        label: 'Create User',
        description: 'Add a new user to the system',
        category: 'database',
        keywords: ['create', 'user', 'add'],
        icon: <Play className="w-4 h-4" />,
        requiresArgs: true,
        argPlaceholder: 'username email role',
        handler: (args) => {
          if (args && args.length >= 3) {
            const [username, email, role] = args;
            alert(`Creating user:\nUsername: ${username}\nEmail: ${email}\nRole: ${role}`);
          }
        },
      },
    ];

    return <InteractiveCommandPalette commands={commands} />;
  },
};

/**
 * KeyboardNavigation - Demonstrates keyboard controls
 */
export const KeyboardNavigation: Story = {
  render: () => {
    const commands = createDefaultCommands(mockHandlers);
    return (
      <div className="min-h-screen bg-background-primary p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">Keyboard Navigation Demo</h1>
            <p className="text-text-secondary">Try these keyboard shortcuts:</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { keys: 'Cmd/Ctrl + K', action: 'Open/close palette' },
              { keys: '↑ / ↓', action: 'Navigate up/down' },
              { keys: 'Enter', action: 'Select command' },
              { keys: 'Esc', action: 'Go back / Close' },
              { keys: 'Backspace', action: 'Navigate back (empty search)' },
              { keys: 'Type to search', action: 'Fuzzy search commands' },
            ].map(({ keys, action }) => (
              <div key={keys} className="bg-background-secondary rounded-lg p-4">
                <kbd className="px-2 py-1 text-sm rounded bg-background-tertiary border border-border-DEFAULT text-text-primary font-mono">
                  {keys}
                </kbd>
                <p className="text-text-secondary text-sm mt-2">{action}</p>
              </div>
            ))}
          </div>

          <InteractiveCommandPalette commands={commands} />
        </div>
      </div>
    );
  },
};

/**
 * SearchDemo - Showcases fuzzy search capabilities
 */
export const SearchDemo: Story = {
  render: () => {
    const commands = createDefaultCommands(mockHandlers);
    return (
      <div className="min-h-screen bg-background-primary p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">Fuzzy Search Demo</h1>
            <p className="text-text-secondary">Try searching for:</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              'database',
              'git',
              'crawl',
              'status',
              'query',
              'workflow',
              'schema',
              'branch',
              'analyze',
            ].map(term => (
              <div key={term} className="bg-background-secondary rounded-lg p-3 text-center">
                <code className="text-accent-blue font-mono text-sm">{term}</code>
              </div>
            ))}
          </div>

          <div className="bg-background-secondary rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-3">Search Features</h2>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li>✓ Exact match gets highest priority</li>
              <li>✓ Starts-with matches score high</li>
              <li>✓ Contains matches score medium</li>
              <li>✓ Character-by-character fuzzy matching</li>
              <li>✓ Searches across label, description, keywords, and category</li>
              <li>✓ Recent commands boosted when not searching</li>
            </ul>
          </div>

          <InteractiveCommandPalette commands={commands} />
        </div>
      </div>
    );
  },
};

/**
 * HierarchicalNavigation - Shows nested command structure
 */
export const HierarchicalNavigation: Story = {
  render: () => {
    const commands = createDefaultCommands(mockHandlers);
    return (
      <div className="min-h-screen bg-background-primary p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">Hierarchical Navigation</h1>
            <p className="text-text-secondary">Navigate through nested commands:</p>
          </div>

          <div className="bg-background-secondary rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Database → Subcommands</h3>
              <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                <li>Execute Query</li>
                <li>View Schema</li>
                <li>Natural Language Query</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Web Scraping → Subcommands</h3>
              <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                <li>Start Crawler</li>
                <li>Stop Crawler</li>
                <li>Crawler Status</li>
                <li>Mine Styleguide</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Git → Subcommands</h3>
              <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                <li>Git Status</li>
                <li>List Branches</li>
                <li>Checkout Branch</li>
                <li>Pull Changes</li>
              </ul>
            </div>
          </div>

          <InteractiveCommandPalette commands={commands} />
        </div>
      </div>
    );
  },
};
