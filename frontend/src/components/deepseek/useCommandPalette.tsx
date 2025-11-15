import { useState, useCallback, useEffect } from 'react';
import { Database, Globe, BarChart2, GitBranch, Zap, FileText, Play, Square, RefreshCw } from 'lucide-react';
import { Command } from './CommandPalette';

/**
 * Local storage key for recent commands
 */
const RECENT_COMMANDS_KEY = 'deepseek-recent-commands';
const MAX_RECENT_COMMANDS = 10;

/**
 * Command Palette Hook
 * Manages command state, recent history, and keyboard shortcuts
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  // Load recent commands from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_COMMANDS_KEY);
      if (stored) {
        setRecentCommands(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load recent commands:', error);
    }
  }, []);

  // Save recent commands to localStorage
  const saveRecentCommand = useCallback((commandId: string) => {
    setRecentCommands(prev => {
      const updated = [commandId, ...prev.filter(id => id !== commandId)].slice(
        0,
        MAX_RECENT_COMMANDS
      );
      try {
        localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save recent commands:', error);
      }
      return updated;
    });
  }, []);

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);

  return {
    open,
    openPalette,
    closePalette,
    recentCommands,
    saveRecentCommand,
  };
}

/**
 * Default Command Definitions
 * Complete hierarchical command tree for DeepSeek operations
 */
export function createDefaultCommands(handlers: {
  onDatabaseQuery?: (query: string) => void;
  onDatabaseSchema?: () => void;
  onDatabaseSuggest?: (prompt: string) => void;
  onCrawlStart?: (url: string, depth?: number) => void;
  onCrawlStop?: () => void;
  onCrawlStatus?: () => void;
  onCrawlerServiceCommand?: (action: 'start' | 'stop' | 'status') => void;
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
}): Command[] {
  return [
    // Database Commands
    {
      id: 'database',
      label: 'Database',
      description: 'Query and manage PostgreSQL database',
      category: 'database',
      keywords: ['db', 'postgres', 'sql', 'query', 'data'],
      icon: <Database className="w-4 h-4" />,
      handler: () => {},
      subCommands: [
        {
          id: 'database.query',
          label: 'Execute Query',
          description: 'Run a custom SQL query',
          category: 'database',
          keywords: ['sql', 'select', 'execute', 'run'],
          icon: <Play className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'SELECT * FROM...',
          handler: (args) => {
            if (args && args.length > 0) {
              handlers.onDatabaseQuery?.(args.join(' '));
            }
          },
        },
        {
          id: 'scraping.crawl.autopilot',
          label: 'Crawler Autopilot',
          description: 'Start/stop the always-on crawler service',
          category: 'scraping',
          keywords: ['service', 'daemon', '24/7', 'autopilot'],
          icon: <RefreshCw className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'start | stop | status',
          handler: (args) => {
            const action = (args?.[0]?.toLowerCase() as 'start' | 'stop' | 'status') || 'status';
            handlers.onCrawlerServiceCommand?.(action);
          },
        },
        {
          id: 'database.schema',
          label: 'View Schema',
          description: 'Show database tables and structure',
          category: 'database',
          keywords: ['tables', 'structure', 'columns', 'schema'],
          icon: <Database className="w-4 h-4" />,
          handler: () => handlers.onDatabaseSchema?.(),
        },
        {
          id: 'database.suggest',
          label: 'Natural Language Query',
          description: 'Convert natural language to SQL',
          category: 'database',
          keywords: ['nl', 'natural', 'ai', 'suggest', 'deepseek'],
          icon: <BarChart2 className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'Show me all users...',
          handler: (args) => {
            if (args && args.length > 0) {
              handlers.onDatabaseSuggest?.(args.join(' '));
            }
          },
        },
      ],
    },

    // Web Scraping Commands
    {
      id: 'scraping',
      label: 'Web Scraping',
      description: 'Crawl websites and extract data',
      category: 'scraping',
      keywords: ['crawl', 'spider', 'extract', 'web', 'scrape'],
      icon: <Globe className="w-4 h-4" />,
      handler: () => {},
      subCommands: [
        {
          id: 'scraping.crawl.start',
          label: 'Start Crawler',
          description: 'Begin crawling a website',
          category: 'scraping',
          keywords: ['start', 'begin', 'crawl', 'url'],
          icon: <Play className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'https://example.com --depth 2',
          handler: (args) => {
            if (args && args.length > 0) {
              const url = args[0];
              const depthIdx = args.indexOf('--depth');
              const depth = depthIdx !== -1 && args[depthIdx + 1] 
                ? parseInt(args[depthIdx + 1], 10) 
                : undefined;
              handlers.onCrawlStart?.(url, depth);
            }
          },
        },
        {
          id: 'scraping.crawl.stop',
          label: 'Stop Crawler',
          description: 'Stop all running crawlers',
          category: 'scraping',
          keywords: ['stop', 'halt', 'cancel'],
          icon: <Square className="w-4 h-4" />,
          handler: () => handlers.onCrawlStop?.(),
        },
        {
          id: 'scraping.crawl.status',
          label: 'Crawler Status',
          description: 'Check status of running crawlers',
          category: 'scraping',
          keywords: ['status', 'progress', 'check'],
          icon: <RefreshCw className="w-4 h-4" />,
          handler: () => handlers.onCrawlStatus?.(),
        },
        {
          id: 'scraping.styleguide',
          label: 'Mine Styleguide',
          description: 'Extract design tokens from website',
          category: 'scraping',
          keywords: ['styleguide', 'design', 'tokens', 'css', 'mining'],
          icon: <Globe className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'https://example.com',
          handler: (args) => {
            if (args && args.length > 0) {
              handlers.onStyleguideMine?.(args[0]);
            }
          },
        },
      ],
    },

    // Analysis Commands
    {
      id: 'analysis',
      label: 'Analysis',
      description: 'Analyze data and discover patterns',
      category: 'analysis',
      keywords: ['analyze', 'data', 'patterns', 'insights'],
      icon: <BarChart2 className="w-4 h-4" />,
      handler: () => {},
      subCommands: [
        {
          id: 'analysis.data',
          label: 'Analyze Data',
          description: 'Run analysis on collected data',
          category: 'analysis',
          keywords: ['data', 'statistics', 'metrics'],
          icon: <BarChart2 className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'dataset_name',
          handler: (args) => {
            if (args && args.length > 0) {
              handlers.onAnalyzeData?.(args[0]);
            }
          },
        },
        {
          id: 'analysis.patterns',
          label: 'Discover Patterns',
          description: 'Find patterns in crawled data',
          category: 'analysis',
          keywords: ['patterns', 'discover', 'find', 'detect'],
          icon: <BarChart2 className="w-4 h-4" />,
          handler: () => handlers.onAnalyzePatterns?.(),
        },
      ],
    },

    // Git Commands
    {
      id: 'git',
      label: 'Git',
      description: 'Version control operations',
      category: 'git',
      keywords: ['git', 'version', 'branch', 'commit', 'source'],
      icon: <GitBranch className="w-4 h-4" />,
      handler: () => {},
      subCommands: [
        {
          id: 'git.status',
          label: 'Git Status',
          description: 'Show working tree status',
          category: 'git',
          keywords: ['status', 'changes', 'working'],
          icon: <GitBranch className="w-4 h-4" />,
          shortcut: 'Ctrl+G S',
          handler: () => handlers.onGitStatus?.(),
        },
        {
          id: 'git.branches',
          label: 'List Branches',
          description: 'Show all local and remote branches',
          category: 'git',
          keywords: ['branches', 'list', 'show'],
          icon: <GitBranch className="w-4 h-4" />,
          handler: () => handlers.onGitBranches?.(),
        },
        {
          id: 'git.checkout',
          label: 'Checkout Branch',
          description: 'Switch to a different branch',
          category: 'git',
          keywords: ['checkout', 'switch', 'change'],
          icon: <GitBranch className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'branch-name',
          handler: (args) => {
            if (args && args.length > 0) {
              handlers.onGitCheckout?.(args[0]);
            }
          },
        },
        {
          id: 'git.pull',
          label: 'Pull Changes',
          description: 'Fetch and merge from remote',
          category: 'git',
          keywords: ['pull', 'fetch', 'merge', 'update'],
          icon: <RefreshCw className="w-4 h-4" />,
          handler: (args) => {
            const remote = args?.[0];
            const branch = args?.[1];
            handlers.onGitPull?.(remote, branch);
          },
        },
      ],
    },

    // Workflow Commands
    {
      id: 'workflows',
      label: 'Workflows',
      description: 'Automation and orchestration',
      category: 'workflows',
      keywords: ['workflow', 'automation', 'orchestration', 'n8n'],
      icon: <Zap className="w-4 h-4" />,
      handler: () => {},
      subCommands: [
        {
          id: 'workflows.list',
          label: 'List Workflows',
          description: 'Show all available workflows',
          category: 'workflows',
          keywords: ['list', 'show', 'all'],
          icon: <Zap className="w-4 h-4" />,
          handler: () => handlers.onWorkflowList?.(),
        },
        {
          id: 'workflows.execute',
          label: 'Execute Workflow',
          description: 'Run a workflow by ID',
          category: 'workflows',
          keywords: ['execute', 'run', 'start'],
          icon: <Play className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'workflow-id',
          handler: (args) => {
            if (args && args.length > 0) {
              handlers.onWorkflowExecute?.(args[0]);
            }
          },
        },
        {
          id: 'workflows.create',
          label: 'Create Workflow',
          description: 'Design a new workflow',
          category: 'workflows',
          keywords: ['create', 'new', 'design'],
          icon: <Zap className="w-4 h-4" />,
          handler: () => handlers.onWorkflowCreate?.(),
        },
      ],
    },

    // Document Commands
    {
      id: 'documents',
      label: 'Documents',
      description: 'RAG ingestion and search',
      category: 'documents',
      keywords: ['rag', 'documents', 'ingest', 'search', 'vectorstore'],
      icon: <FileText className="w-4 h-4" />,
      handler: () => {},
      subCommands: [
        {
          id: 'documents.ingest.url',
          label: 'Ingest URL',
          description: 'Add webpage to RAG vectorstore',
          category: 'documents',
          keywords: ['ingest', 'url', 'webpage', 'add'],
          icon: <Globe className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'https://example.com',
          handler: (args) => {
            if (args && args.length > 0) {
              handlers.onIngestUrl?.(args[0]);
            }
          },
        },
        {
          id: 'documents.ingest.upload',
          label: 'Upload Document',
          description: 'Upload file to RAG vectorstore',
          category: 'documents',
          keywords: ['upload', 'file', 'document', 'add'],
          icon: <FileText className="w-4 h-4" />,
          handler: () => handlers.onIngestUpload?.(),
        },
        {
          id: 'documents.search',
          label: 'Search Documents',
          description: 'Query RAG vectorstore',
          category: 'documents',
          keywords: ['search', 'query', 'find', 'rag'],
          icon: <BarChart2 className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'search query...',
          handler: (args) => {
            if (args && args.length > 0) {
              handlers.onSearchDocs?.(args.join(' '));
            }
          },
        },
      ],
    },

    // System Commands
    {
      id: 'system',
      label: 'System',
      description: 'Service management and configuration',
      category: 'system',
      keywords: ['system', 'services', 'config', 'settings'],
      icon: <RefreshCw className="w-4 h-4" />,
      handler: () => {},
      subCommands: [
        {
          id: 'system.services.list',
          label: 'List Services',
          description: 'Show all running services',
          category: 'system',
          keywords: ['services', 'list', 'status'],
          icon: <RefreshCw className="w-4 h-4" />,
          handler: () => handlers.onServicesList?.(),
        },
        {
          id: 'system.services.start',
          label: 'Start Service',
          description: 'Start a service by ID',
          category: 'system',
          keywords: ['start', 'service', 'begin'],
          icon: <Play className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'service-id',
          handler: (args) => {
            if (args && args.length > 0) {
              handlers.onServiceStart?.(args[0]);
            }
          },
        },
        {
          id: 'system.services.stop',
          label: 'Stop Service',
          description: 'Stop a running service',
          category: 'system',
          keywords: ['stop', 'service', 'halt'],
          icon: <Square className="w-4 h-4" />,
          requiresArgs: true,
          argPlaceholder: 'service-id',
          handler: (args) => {
            if (args && args.length > 0) {
              handlers.onServiceStop?.(args[0]);
            }
          },
        },
      ],
    },
  ];
}
