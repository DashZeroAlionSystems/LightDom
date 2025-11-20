import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronRight, Database, Globe, BarChart2, Settings, Zap, GitBranch, FileText, Terminal, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Command Category Types
 * Hierarchical structure following VS Code patterns
 */
export type CommandCategory = 
  | 'database'
  | 'scraping'
  | 'analysis'
  | 'git'
  | 'workflows'
  | 'system'
  | 'blockchain'
  | 'documents';

/**
 * Command Definition Interface
 */
export interface Command {
  id: string;
  label: string;
  description: string;
  category: CommandCategory;
  keywords: string[];
  shortcut?: string;
  icon?: React.ReactNode;
  handler: (args?: string[]) => Promise<void> | void;
  subCommands?: Command[];
  requiresArgs?: boolean;
  argPlaceholder?: string;
}

/**
 * Command Category Metadata
 */
interface CategoryMetadata {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

const categoryMetadata: Record<CommandCategory, CategoryMetadata> = {
  database: {
    icon: <Database className="w-4 h-4" />,
    label: 'Database',
    description: 'Query and manage database operations',
    color: 'text-blue-400',
  },
  scraping: {
    icon: <Globe className="w-4 h-4" />,
    label: 'Web Scraping',
    description: 'Crawl websites and extract data',
    color: 'text-green-400',
  },
  analysis: {
    icon: <BarChart2 className="w-4 h-4" />,
    label: 'Analysis',
    description: 'Analyze data and patterns',
    color: 'text-purple-400',
  },
  git: {
    icon: <GitBranch className="w-4 h-4" />,
    label: 'Git',
    description: 'Version control operations',
    color: 'text-orange-400',
  },
  workflows: {
    icon: <Zap className="w-4 h-4" />,
    label: 'Workflows',
    description: 'Automation and orchestration',
    color: 'text-yellow-400',
  },
  system: {
    icon: <Settings className="w-4 h-4" />,
    label: 'System',
    description: 'System configuration and services',
    color: 'text-gray-400',
  },
  blockchain: {
    icon: <Cpu className="w-4 h-4" />,
    label: 'Blockchain',
    description: 'Mining and smart contracts',
    color: 'text-cyan-400',
  },
  documents: {
    icon: <FileText className="w-4 h-4" />,
    label: 'Documents',
    description: 'Document ingestion and RAG',
    color: 'text-pink-400',
  },
};

/**
 * Fuzzy Search Algorithm
 * Scores commands based on query match quality
 */
function fuzzyScore(query: string, target: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerTarget = target.toLowerCase();
  
  // Exact match gets highest score
  if (lowerTarget === lowerQuery) return 1000;
  
  // Starts with query gets high score
  if (lowerTarget.startsWith(lowerQuery)) return 900;
  
  // Contains query gets medium score
  if (lowerTarget.includes(lowerQuery)) return 700;
  
  // Fuzzy character matching
  let queryIndex = 0;
  let targetIndex = 0;
  let score = 0;
  let consecutive = 0;
  
  while (queryIndex < lowerQuery.length && targetIndex < lowerTarget.length) {
    if (lowerQuery[queryIndex] === lowerTarget[targetIndex]) {
      queryIndex++;
      consecutive++;
      score += 10 + consecutive * 5; // Bonus for consecutive matches
    } else {
      consecutive = 0;
    }
    targetIndex++;
  }
  
  // All query characters matched
  if (queryIndex === lowerQuery.length) {
    return score;
  }
  
  return 0; // No match
}

/**
 * Search and rank commands using fuzzy matching
 */
function searchCommands(query: string, commands: Command[]): Command[] {
  if (!query.trim()) return commands;
  
  const scored = commands
    .map(cmd => {
      // Search in label, description, keywords, and category
      const labelScore = fuzzyScore(query, cmd.label);
      const descScore = fuzzyScore(query, cmd.description) * 0.7;
      const keywordScore = Math.max(...cmd.keywords.map(k => fuzzyScore(query, k))) * 0.8;
      const categoryScore = fuzzyScore(query, cmd.category) * 0.5;
      
      const totalScore = labelScore + descScore + keywordScore + categoryScore;
      
      return { command: cmd, score: totalScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ command }) => command);
  
  return scored;
}

/**
 * CommandPalette Props
 */
export interface CommandPaletteProps {
  commands: Command[];
  open: boolean;
  onClose: () => void;
  onCommandExecute?: (command: Command, args?: string[]) => void;
  recentCommands?: string[]; // Command IDs
  className?: string;
}

/**
 * VS Code-style Command Palette
 * Hierarchical, searchable, keyboard-navigable
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands,
  open,
  onClose,
  onCommandExecute,
  recentCommands = [],
  className,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState<Command[]>([]);
  const [argInput, setArgInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Current command context (for subcommands)
  const currentCommand = breadcrumbs[breadcrumbs.length - 1];
  const currentCommands = currentCommand?.subCommands ?? commands;
  
  // Filter and rank commands
  const filteredCommands = useMemo(() => {
    const results = searchCommands(query, currentCommands);
    
    // Boost recent commands
    if (recentCommands.length > 0 && !query.trim()) {
      const recent = results.filter(cmd => recentCommands.includes(cmd.id));
      const others = results.filter(cmd => !recentCommands.includes(cmd.id));
      return [...recent, ...others];
    }
    
    return results;
  }, [query, currentCommands, recentCommands]);
  
  // Group commands by category
  const groupedCommands = useMemo(() => {
    if (query.trim()) return null; // Don't group when searching
    
    const groups: Partial<Record<CommandCategory, Command[]>> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category]!.push(cmd);
    });
    return groups;
  }, [filteredCommands, query]);
  
  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setBreadcrumbs([]);
      setArgInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);
  
  // Auto-scroll to selected item
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          if (selected.subCommands) {
            // Navigate into subcommands
            setBreadcrumbs([...breadcrumbs, selected]);
            setQuery('');
            setSelectedIndex(0);
          } else if (selected.requiresArgs && !argInput.trim()) {
            // Focus arg input if needed
            return;
          } else {
            // Execute command
            const args = argInput.trim() ? argInput.split(/\s+/) : undefined;
            onCommandExecute?.(selected, args);
            selected.handler(args);
            onClose();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (breadcrumbs.length > 0) {
          // Go back in hierarchy
          setBreadcrumbs(breadcrumbs.slice(0, -1));
          setQuery('');
          setSelectedIndex(0);
        } else {
          onClose();
        }
        break;
      case 'Backspace':
        if (!query && breadcrumbs.length > 0) {
          // Go back when clearing search
          setBreadcrumbs(breadcrumbs.slice(0, -1));
          setSelectedIndex(0);
        }
        break;
    }
  }, [filteredCommands, selectedIndex, breadcrumbs, query, argInput, onCommandExecute, onClose]);
  
  if (!open) return null;
  
  const selectedCommand = filteredCommands[selectedIndex];
  
  return (
    <div 
      className={cn(
        'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh]',
        className
      )}
      onClick={onClose}
    >
      <div 
        className="bg-surface-container-high rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-outline/30"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="border-b border-outline/30">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 px-4 pt-3 pb-2 text-sm text-on-surface-variant">
              {breadcrumbs.map((cmd, idx) => (
                <React.Fragment key={cmd.id}>
                  <button
                    onClick={() => {
                      setBreadcrumbs(breadcrumbs.slice(0, idx));
                      setQuery('');
                      setSelectedIndex(0);
                    }}
                    className="hover:text-primary transition-colors"
                  >
                    {cmd.label}
                  </button>
                  <ChevronRight className="w-3 h-3" />
                </React.Fragment>
              ))}
              <span className="text-on-surface">Current</span>
            </div>
          )}
          
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Search className="w-5 h-5 text-on-surface-variant" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={breadcrumbs.length > 0 ? `Search ${currentCommand.label}...` : "Search commands or type to filter..."}
              className="flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant outline-none text-lg"
            />
            <kbd className="px-2 py-1 text-xs rounded bg-surface-container border border-outline/30 text-on-surface-variant">
              Esc
            </kbd>
          </div>
          
          {/* Argument Input */}
          {selectedCommand?.requiresArgs && (
            <div className="px-4 pb-3 flex items-center gap-3">
              <Terminal className="w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                value={argInput}
                onChange={e => setArgInput(e.target.value)}
                placeholder={selectedCommand.argPlaceholder || 'Enter arguments...'}
                className="flex-1 bg-surface-container rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant outline-none border border-outline/30 focus:border-primary"
              />
            </div>
          )}
        </div>
        
        {/* Command List */}
        <div 
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-outline/50 scrollbar-track-transparent"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
              <p className="text-xs mt-1">Try a different search query</p>
            </div>
          ) : groupedCommands ? (
            // Grouped by category (no search)
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="py-2">
                <div className="px-4 py-2 flex items-center gap-2">
                  <span className={cn('text-sm font-semibold', categoryMetadata[category as CommandCategory].color)}>
                    {categoryMetadata[category as CommandCategory].icon}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                    {categoryMetadata[category as CommandCategory].label}
                  </span>
                </div>
                {cmds!.map((cmd, _globalIdx) => {
                  const index = filteredCommands.indexOf(cmd);
                  const isSelected = index === selectedIndex;
                  const isRecent = recentCommands.includes(cmd.id);
                  
                  return (
                    <button
                      key={cmd.id}
                      data-index={index}
                      onClick={() => {
                        if (cmd.subCommands) {
                          setBreadcrumbs([...breadcrumbs, cmd]);
                          setQuery('');
                          setSelectedIndex(0);
                        } else {
                          const args = argInput.trim() ? argInput.split(/\s+/) : undefined;
                          onCommandExecute?.(cmd, args);
                          cmd.handler(args);
                          onClose();
                        }
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full px-4 py-3 flex items-center gap-3 transition-colors',
                        isSelected ? 'bg-primary/10' : 'hover:bg-surface-container-low'
                      )}
                    >
                      {cmd.icon && (
                        <span className={cn('flex-shrink-0', isSelected ? 'text-primary' : 'text-on-surface-variant')}>
                          {cmd.icon}
                        </span>
                      )}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className={cn('font-medium', isSelected ? 'text-primary' : 'text-on-surface')}>
                            {cmd.label}
                          </span>
                          {isRecent && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-accent-blue/20 text-accent-blue">
                              Recent
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">{cmd.description}</p>
                      </div>
                      {cmd.subCommands && (
                        <ChevronRight className={cn('w-4 h-4 flex-shrink-0', isSelected ? 'text-primary' : 'text-on-surface-variant')} />
                      )}
                      {cmd.shortcut && (
                        <kbd className="px-2 py-1 text-xs rounded bg-surface-container border border-outline/30 text-on-surface-variant">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            // Flat list (with search)
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              const isRecent = recentCommands.includes(cmd.id);
              const categoryMeta = categoryMetadata[cmd.category];
              
              return (
                <button
                  key={cmd.id}
                  data-index={index}
                  onClick={() => {
                    if (cmd.subCommands) {
                      setBreadcrumbs([...breadcrumbs, cmd]);
                      setQuery('');
                      setSelectedIndex(0);
                    } else {
                      const args = argInput.trim() ? argInput.split(/\s+/) : undefined;
                      onCommandExecute?.(cmd, args);
                      cmd.handler(args);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full px-4 py-3 flex items-center gap-3 transition-colors',
                    isSelected ? 'bg-primary/10' : 'hover:bg-surface-container-low'
                  )}
                >
                  {cmd.icon && (
                    <span className={cn('flex-shrink-0', isSelected ? 'text-primary' : 'text-on-surface-variant')}>
                      {cmd.icon}
                    </span>
                  )}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-medium', isSelected ? 'text-primary' : 'text-on-surface')}>
                        {cmd.label}
                      </span>
                      <span className={cn('text-[10px] uppercase tracking-wide', categoryMeta.color)}>
                        {categoryMeta.label}
                      </span>
                      {isRecent && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-accent-blue/20 text-accent-blue">
                          Recent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">{cmd.description}</p>
                  </div>
                  {cmd.subCommands && (
                    <ChevronRight className={cn('w-4 h-4 flex-shrink-0', isSelected ? 'text-primary' : 'text-on-surface-variant')} />
                  )}
                  {cmd.shortcut && (
                    <kbd className="px-2 py-1 text-xs rounded bg-surface-container border border-outline/30 text-on-surface-variant">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>
        
        {/* Footer Hints */}
        <div className="border-t border-outline/30 px-4 py-2 flex items-center justify-between text-xs text-on-surface-variant">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline/30">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline/30">Enter</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline/30">Esc</kbd>
              {breadcrumbs.length > 0 ? 'Back' : 'Close'}
            </span>
          </div>
          {selectedCommand && (
            <span className="text-primary">
              {selectedCommand.subCommands ? 'Press Enter to explore →' : 'Press Enter to execute'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
