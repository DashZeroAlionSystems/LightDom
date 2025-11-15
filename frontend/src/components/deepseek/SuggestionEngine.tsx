import { useState, useEffect, useCallback } from 'react';
import type { Command } from './CommandPalette';

/**
 * Context Types for AI Suggestions
 */
export interface AppContext {
  currentPage?: string;           // Current route/page
  selectedText?: string;          // Selected text in editor
  recentActions?: string[];       // Recent user actions
  openFiles?: string[];           // Open files/documents
  gitBranch?: string;            // Current git branch
  hasChanges?: boolean;          // Uncommitted changes
  errorCount?: number;           // Active errors/warnings
  services?: ServiceStatus[];    // Running services
  lastCommand?: string;          // Last executed command
  userRole?: 'admin' | 'developer' | 'analyst';  // User role
}

export interface ServiceStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
}

/**
 * Suggestion Scoring Weights
 */
const WEIGHTS = {
  EXACT_MATCH: 1000,
  RECENT_USAGE: 500,
  CONTEXT_MATCH: 300,
  KEYWORD_MATCH: 200,
  CATEGORY_MATCH: 100,
  FREQUENT_USE: 150,
  ROLE_MATCH: 250,
  ERROR_RELEVANT: 400,
};

/**
 * Command Usage Statistics
 */
interface CommandStats {
  commandId: string;
  count: number;
  lastUsed: number;
  successRate: number;
  avgExecutionTime: number;
}

/**
 * Suggestion Result
 */
export interface Suggestion {
  command: Command;
  score: number;
  reason: string[];  // Why this was suggested
  confidence: number;  // 0-1 confidence score
}

/**
 * AI Suggestion Engine
 * Analyzes context and ranks commands by relevance
 */
export class SuggestionEngine {
  private usageStats: Map<string, CommandStats> = new Map();
  private contextHistory: AppContext[] = [];
  private maxHistoryLength = 50;

  constructor() {
    this.loadStats();
  }

  /**
   * Load usage statistics from localStorage
   */
  private loadStats(): void {
    try {
      const stored = localStorage.getItem('command-usage-stats');
      if (stored) {
        const stats = JSON.parse(stored);
        this.usageStats = new Map(Object.entries(stats));
      }
    } catch (error) {
      console.warn('Failed to load command stats:', error);
    }
  }

  /**
   * Save usage statistics to localStorage
   */
  private saveStats(): void {
    try {
      const stats = Object.fromEntries(this.usageStats);
      localStorage.setItem('command-usage-stats', JSON.stringify(stats));
    } catch (error) {
      console.warn('Failed to save command stats:', error);
    }
  }

  /**
   * Record command execution
   */
  public recordExecution(
    commandId: string,
    success: boolean,
    executionTime: number
  ): void {
    const existing = this.usageStats.get(commandId);
    
    if (existing) {
      const newCount = existing.count + 1;
      const newSuccessRate = 
        (existing.successRate * existing.count + (success ? 1 : 0)) / newCount;
      const newAvgTime = 
        (existing.avgExecutionTime * existing.count + executionTime) / newCount;
      
      this.usageStats.set(commandId, {
        commandId,
        count: newCount,
        lastUsed: Date.now(),
        successRate: newSuccessRate,
        avgExecutionTime: newAvgTime,
      });
    } else {
      this.usageStats.set(commandId, {
        commandId,
        count: 1,
        lastUsed: Date.now(),
        successRate: success ? 1 : 0,
        avgExecutionTime: executionTime,
      });
    }
    
    this.saveStats();
  }

  /**
   * Add context to history
   */
  public addContext(context: AppContext): void {
    this.contextHistory.push(context);
    if (this.contextHistory.length > this.maxHistoryLength) {
      this.contextHistory.shift();
    }
  }

  /**
   * Get suggestions based on current context
   */
  public getSuggestions(
    commands: Command[],
    context: AppContext,
    limit: number = 5
  ): Suggestion[] {
    const flatCommands = this.flattenCommands(commands);
    const scored = flatCommands.map(cmd => this.scoreCommand(cmd, context));
    
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    
    // Take top N and normalize confidence
    const topScored = scored.slice(0, limit);
    const maxScore = topScored[0]?.score || 1;
    
    return topScored.map(s => ({
      ...s,
      confidence: Math.min(s.score / maxScore, 1),
    }));
  }

  /**
   * Flatten nested commands into single array
   */
  private flattenCommands(commands: Command[]): Command[] {
    const result: Command[] = [];
    
    const flatten = (cmds: Command[]) => {
      cmds.forEach(cmd => {
        result.push(cmd);
        if (cmd.subCommands) {
          flatten(cmd.subCommands);
        }
      });
    };
    
    flatten(commands);
    return result;
  }

  /**
   * Score a command based on context
   */
  private scoreCommand(command: Command, context: AppContext): Suggestion {
    let score = 0;
    const reasons: string[] = [];

    // Recent usage
    if (context.recentActions?.includes(command.id)) {
      score += WEIGHTS.RECENT_USAGE;
      reasons.push('Recently used');
    }

    // Usage frequency
    const stats = this.usageStats.get(command.id);
    if (stats) {
      const frequencyScore = Math.min(stats.count / 10, 1) * WEIGHTS.FREQUENT_USE;
      score += frequencyScore;
      if (stats.count > 5) {
        reasons.push(`Used ${stats.count} times`);
      }
      
      // Penalize low success rate
      if (stats.successRate < 0.5) {
        score *= 0.7;
        reasons.push('Low success rate');
      }
    }

    // Context-specific scoring
    score += this.scoreByContext(command, context, reasons);

    // Role-based scoring
    score += this.scoreByRole(command, context, reasons);

    // Error-relevant commands
    if (context.errorCount && context.errorCount > 0) {
      if (command.keywords.some(k => ['fix', 'error', 'debug', 'status'].includes(k))) {
        score += WEIGHTS.ERROR_RELEVANT;
        reasons.push('May help with errors');
      }
    }

    return {
      command,
      score,
      reason: reasons,
      confidence: 0, // Will be normalized later
    };
  }

  /**
   * Score based on current context
   */
  private scoreByContext(
    command: Command,
    context: AppContext,
    reasons: string[]
  ): number {
    let score = 0;

    // Page-specific suggestions
    if (context.currentPage) {
      const page = context.currentPage.toLowerCase();
      
      if (page.includes('database') && command.category === 'database') {
        score += WEIGHTS.CONTEXT_MATCH;
        reasons.push('Relevant to current page');
      }
      
      if (page.includes('git') && command.category === 'git') {
        score += WEIGHTS.CONTEXT_MATCH;
        reasons.push('Relevant to current page');
      }
      
      if (page.includes('workflow') && command.category === 'workflows') {
        score += WEIGHTS.CONTEXT_MATCH;
        reasons.push('Relevant to current page');
      }
    }

    // Selected text suggests action
    if (context.selectedText) {
      const text = context.selectedText.toLowerCase();
      
      if (text.includes('select') && command.keywords.includes('query')) {
        score += WEIGHTS.KEYWORD_MATCH;
        reasons.push('Matches selected text');
      }
      
      if (text.includes('http') && command.category === 'scraping') {
        score += WEIGHTS.KEYWORD_MATCH;
        reasons.push('URL detected in selection');
      }
    }

    // Git context
    if (context.gitBranch && command.category === 'git') {
      score += WEIGHTS.CATEGORY_MATCH;
      
      if (context.hasChanges && command.id === 'git.status') {
        score += WEIGHTS.CONTEXT_MATCH;
        reasons.push('Uncommitted changes detected');
      }
    }

    // Service context
    if (context.services) {
      const stoppedServices = context.services.filter(s => s.status === 'stopped');
      const errorServices = context.services.filter(s => s.status === 'error');
      
      if (stoppedServices.length > 0 && command.id === 'system.services.start') {
        score += WEIGHTS.CONTEXT_MATCH;
        reasons.push(`${stoppedServices.length} service(s) stopped`);
      }
      
      if (errorServices.length > 0 && command.id === 'system.services.list') {
        score += WEIGHTS.ERROR_RELEVANT;
        reasons.push(`${errorServices.length} service(s) in error state`);
      }
    }

    return score;
  }

  /**
   * Score based on user role
   */
  private scoreByRole(
    command: Command,
    context: AppContext,
    reasons: string[]
  ): number {
    let score = 0;

    if (!context.userRole) return score;

    switch (context.userRole) {
      case 'admin':
        if (['system', 'database'].includes(command.category)) {
          score += WEIGHTS.ROLE_MATCH;
          reasons.push('Relevant to admin role');
        }
        break;
      
      case 'developer':
        if (['git', 'workflows', 'database'].includes(command.category)) {
          score += WEIGHTS.ROLE_MATCH;
          reasons.push('Relevant to developer role');
        }
        break;
      
      case 'analyst':
        if (['analysis', 'database', 'documents'].includes(command.category)) {
          score += WEIGHTS.ROLE_MATCH;
          reasons.push('Relevant to analyst role');
        }
        break;
    }

    return score;
  }

  /**
   * Predict next command based on patterns
   */
  public predictNext(lastCommand: string): string | null {
    // Common command sequences
    const sequences: Record<string, string[]> = {
      'git.status': ['git.checkout', 'git.pull', 'database.query'],
      'database.query': ['database.schema', 'analysis.data'],
      'scraping.crawl.start': ['scraping.crawl.status', 'analysis.patterns'],
      'workflows.create': ['workflows.execute', 'workflows.list'],
      'database.schema': ['database.query', 'database.suggest'],
    };

    const nextCommands = sequences[lastCommand];
    if (!nextCommands || nextCommands.length === 0) return null;

    // Return most frequently used next command
    const stats = nextCommands
      .map(id => ({ id, stats: this.usageStats.get(id) }))
      .filter(({ stats }) => stats)
      .sort((a, b) => (b.stats?.count || 0) - (a.stats?.count || 0));

    return stats[0]?.id || nextCommands[0];
  }

  /**
   * Get command statistics
   */
  public getStats(commandId: string): CommandStats | null {
    return this.usageStats.get(commandId) || null;
  }

  /**
   * Clear all statistics
   */
  public clearStats(): void {
    this.usageStats.clear();
    this.contextHistory = [];
    localStorage.removeItem('command-usage-stats');
  }
}

/**
 * React Hook for Suggestion Engine
 */
export function useSuggestionEngine(commands: Command[]) {
  const [engine] = useState(() => new SuggestionEngine());
  const [context, setContext] = useState<AppContext>({});
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Update suggestions when context changes
  useEffect(() => {
    const newSuggestions = engine.getSuggestions(commands, context, 5);
    setSuggestions(newSuggestions);
    engine.addContext(context);
  }, [engine, commands, context]);

  const updateContext = useCallback((updates: Partial<AppContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  }, []);

  const recordExecution = useCallback(
    (commandId: string, success: boolean, executionTime: number) => {
      engine.recordExecution(commandId, success, executionTime);
      
      // Update context with last command
      setContext(prev => ({
        ...prev,
        lastCommand: commandId,
        recentActions: [commandId, ...(prev.recentActions || [])].slice(0, 10),
      }));
    },
    [engine]
  );

  const predictNext = useCallback(
    (lastCommand: string) => engine.predictNext(lastCommand),
    [engine]
  );

  const getStats = useCallback(
    (commandId: string) => engine.getStats(commandId),
    [engine]
  );

  const clearStats = useCallback(() => {
    engine.clearStats();
    setSuggestions([]);
  }, [engine]);

  return {
    suggestions,
    context,
    updateContext,
    recordExecution,
    predictNext,
    getStats,
    clearStats,
  };
}

/**
 * Suggestion Display Component
 */
export interface SuggestionWidgetProps {
  suggestions: Suggestion[];
  onSelect: (command: Command) => void;
  className?: string;
}

export const SuggestionWidget: React.FC<SuggestionWidgetProps> = ({
  suggestions,
  onSelect,
  className,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className={`bg-surface-container-high rounded-2xl border border-outline/30 p-3 space-y-2 ${className || ''}`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
        <span>💡</span>
        <span>Suggested Commands</span>
      </div>
      
      {suggestions.map(({ command, reason, confidence }) => (
        <button
          key={command.id}
          onClick={() => onSelect(command)}
          className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-low transition-colors group"
        >
          <div className="flex items-start gap-2">
            {command.icon && (
              <span className="flex-shrink-0 text-on-surface-variant group-hover:text-primary transition-colors mt-0.5">
                {command.icon}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-on-surface text-sm">
                  {command.label}
                </span>
                <div 
                  className="h-1.5 rounded-full bg-primary/20 flex-shrink-0"
                  style={{ width: `${confidence * 40}px` }}
                >
                  <div 
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                {reason.join(' • ')}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SuggestionEngine;
