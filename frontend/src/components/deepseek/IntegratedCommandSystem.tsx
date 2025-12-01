import React, { useCallback, useState } from 'react';
import { CommandPalette } from './CommandPalette';
import { useCommandPalette, createDefaultCommands } from './useCommandPalette';
import { SuggestionWidget, useSuggestionEngine } from './SuggestionEngine';
import type { Command } from './CommandPalette';
import type { AppContext } from './SuggestionEngine';
import { Sparkles, Terminal, GitBranch, Database, Activity } from 'lucide-react';

/**
 * Integrated Command System Demo
 * Shows command palette + AI suggestions working together
 */
export const IntegratedCommandSystemDemo: React.FC = () => {
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  // Command palette hook
  const { open, openPalette, closePalette, recentCommands, saveRecentCommand } = useCommandPalette();

  // Add log entry helper
  const addLog = useCallback((message: string) => {
    setExecutionLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 20));
  }, []);

  const handleCrawlerServiceCommand = useCallback(
    async (action: 'start' | 'stop' | 'status') => {
      try {
        const response = await fetch('/api/crawler/service', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            payload?.message || payload?.error || response.statusText || 'Unknown crawler service error'
          );
        }

        addLog(
          `Crawler service ${action} => ${
            payload?.message || payload?.data?.status || payload?.response?.status || 'OK'
          }`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        addLog(`Crawler service ${action} failed: ${message}`);
      }
    },
    [addLog]
  );

  // Create command handlers
  const commands = createDefaultCommands({
    onDatabaseQuery: (query) => addLog(`Executing SQL: ${query}`),
    onDatabaseSchema: () => addLog('Showing database schema'),
    onDatabaseSuggest: (prompt) => addLog(`Converting to SQL: ${prompt}`),
    onCrawlStart: (url, depth) => addLog(`Starting crawler: ${url} (depth: ${depth || 1})`),
    onCrawlStop: () => addLog('Stopping crawler'),
    onCrawlStatus: () => addLog('Fetching crawler status'),
    onCrawlerServiceCommand: (action) => {
      void handleCrawlerServiceCommand(action);
    },
    onStyleguideMine: (url) => addLog(`Mining styleguide from: ${url}`),
    onAnalyzeData: (type) => addLog(`Analyzing ${type} data`),
    onAnalyzePatterns: () => addLog('Discovering patterns'),
    onGitStatus: () => addLog('Git status: 3 files changed'),
    onGitBranches: () => addLog('Listing branches: main, dev, feature/xyz'),
    onGitCheckout: (branch) => addLog(`Checking out: ${branch}`),
    onGitPull: (remote, branch) => addLog(`Pulling from ${remote || 'origin'}/${branch || 'main'}`),
    onWorkflowList: () => addLog('Listing workflows'),
    onWorkflowExecute: (id) => addLog(`Executing workflow: ${id}`),
    onWorkflowCreate: () => addLog('Opening workflow designer'),
    onIngestUrl: (url) => addLog(`Ingesting document: ${url}`),
    onIngestUpload: () => addLog('Opening file picker'),
    onSearchDocs: (query) => addLog(`Searching documents: ${query}`),
    onServicesList: () => addLog('Listing services'),
    onServiceStart: (id) => addLog(`Starting service: ${id}`),
    onServiceStop: (id) => addLog(`Stopping service: ${id}`),
  });

  // Suggestion engine hook
  const {
    suggestions,
    context,
    updateContext,
    recordExecution,
    clearStats,
  } = useSuggestionEngine(commands);

  // Handle command execution
  const handleCommandExecute = useCallback(
    (command: Command, args?: string[]) => {
      const startTime = Date.now();
      
      try {
        // Execute command
        command.handler(args);
        
        // Record execution
        const executionTime = Date.now() - startTime;
        recordExecution(command.id, true, executionTime);
        saveRecentCommand(command.id);
        
        addLog(`✓ Executed: ${command.label}${args ? ` (${args.join(' ')})` : ''}`);
      } catch (error) {
        const executionTime = Date.now() - startTime;
        recordExecution(command.id, false, executionTime);
        addLog(`✗ Failed: ${command.label} - ${error}`);
      }
    },
    [recordExecution, saveRecentCommand, addLog]
  );

  // Simulate context changes
  const simulateContext = (contextType: string) => {
    const contexts: Record<string, Partial<AppContext>> = {
      database: {
        currentPage: 'database',
        selectedText: 'SELECT * FROM users',
        userRole: 'developer',
      },
      git: {
        currentPage: 'git',
        gitBranch: 'feature/new-feature',
        hasChanges: true,
        userRole: 'developer',
      },
      errors: {
        currentPage: 'dashboard',
        errorCount: 3,
        services: [
          { id: 'api', name: 'API Server', status: 'running' },
          { id: 'db', name: 'PostgreSQL', status: 'stopped' },
          { id: 'redis', name: 'Redis', status: 'error' },
        ],
        userRole: 'admin',
      },
      scraping: {
        currentPage: 'scraping',
        selectedText: 'https://example.com',
        userRole: 'analyst',
      },
    };

    updateContext(contexts[contextType] || {});
    setCurrentPage(contextType);
    addLog(`Context changed: ${contextType}`);
  };

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-accent-blue" />
            <h1 className="text-4xl font-bold text-text-primary">
              Integrated Command System
            </h1>
          </div>
          <p className="text-text-secondary text-lg">
            VS Code-style command palette with AI-powered suggestions
          </p>
          <div className="flex items-center justify-center gap-3">
            <kbd className="px-3 py-1.5 rounded-lg bg-background-secondary border border-border-DEFAULT text-text-primary font-mono text-sm">
              Cmd/Ctrl + K
            </kbd>
            <span className="text-text-tertiary">to open command palette</span>
          </div>
        </div>

        {/* Context Simulator */}
        <div className="bg-background-secondary rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-text-primary font-semibold">
            <Activity className="w-5 h-5" />
            <h2>Simulate Context</h2>
          </div>
          <p className="text-text-secondary text-sm">
            Change the application context to see how AI suggestions adapt
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'database', label: 'Database Work', icon: <Database className="w-4 h-4" /> },
              { id: 'git', label: 'Git Operations', icon: <GitBranch className="w-4 h-4" /> },
              { id: 'errors', label: 'Service Errors', icon: <Activity className="w-4 h-4" /> },
              { id: 'scraping', label: 'Web Scraping', icon: <Terminal className="w-4 h-4" /> },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => simulateContext(id)}
                className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                  currentPage === id
                    ? 'bg-accent-blue text-white border-accent-blue'
                    : 'bg-background-tertiary text-text-primary border-border-DEFAULT hover:border-accent-blue'
                }`}
              >
                {icon}
                <span className="font-medium text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* AI Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-blue" />
                AI Suggestions
              </h2>
              <button
                onClick={clearStats}
                className="px-3 py-1.5 text-xs rounded-lg bg-background-tertiary text-text-secondary hover:bg-background-elevated transition-colors"
              >
                Clear Stats
              </button>
            </div>
            
            <SuggestionWidget
              suggestions={suggestions}
              onSelect={(cmd) => {
                handleCommandExecute(cmd);
              }}
            />

            {suggestions.length === 0 && (
              <div className="bg-background-secondary rounded-2xl p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-text-tertiary opacity-50" />
                <p className="text-text-secondary">
                  No suggestions yet. Change context or execute some commands to train the AI.
                </p>
              </div>
            )}

            {/* Current Context */}
            <div className="bg-background-secondary rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Current Context
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Page:</span>
                  <span className="text-text-primary font-mono">{context.currentPage || 'none'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Role:</span>
                  <span className="text-text-primary font-mono">{context.userRole || 'none'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Git Branch:</span>
                  <span className="text-text-primary font-mono">{context.gitBranch || 'none'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Errors:</span>
                  <span className="text-text-primary font-mono">{context.errorCount || 0}</span>
                </div>
                {context.selectedText && (
                  <div className="pt-2 border-t border-border-DEFAULT">
                    <span className="text-text-tertiary text-xs">Selected Text:</span>
                    <code className="block mt-1 p-2 bg-background-tertiary rounded text-xs text-text-primary font-mono">
                      {context.selectedText}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Execution Log */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <Terminal className="w-5 h-5 text-accent-blue" />
              Execution Log
            </h2>
            
            <div className="bg-background-secondary rounded-2xl p-4 space-y-2 font-mono text-sm max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-border-DEFAULT scrollbar-track-transparent">
              {executionLog.length === 0 ? (
                <p className="text-text-tertiary text-center py-8">
                  No commands executed yet. Open command palette (Cmd+K) or click a suggestion.
                </p>
              ) : (
                executionLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`py-1 ${
                      log.includes('✓')
                        ? 'text-semantic-success'
                        : log.includes('✗')
                        ? 'text-semantic-error'
                        : 'text-text-secondary'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-background-secondary rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={openPalette}
                  className="px-3 py-2 rounded-xl bg-accent-blue text-white hover:bg-accent-blue-dark transition-colors text-sm font-medium"
                >
                  Open Palette
                </button>
                <button
                  onClick={() => setExecutionLog([])}
                  className="px-3 py-2 rounded-xl bg-background-tertiary text-text-primary hover:bg-background-elevated transition-colors text-sm font-medium"
                >
                  Clear Log
                </button>
              </div>
            </div>

            {/* Recent Commands */}
            {recentCommands.length > 0 && (
              <div className="bg-background-secondary rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                  Recent Commands
                </h3>
                <div className="space-y-1">
                  {recentCommands.slice(0, 5).map(id => (
                    <div key={id} className="text-xs text-text-secondary font-mono py-1">
                      {id}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        commands={commands}
        open={open}
        onClose={closePalette}
        onCommandExecute={handleCommandExecute}
        recentCommands={recentCommands}
      />
    </div>
  );
};

export default IntegratedCommandSystemDemo;
