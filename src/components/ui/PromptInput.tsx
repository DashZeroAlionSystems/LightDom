import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Send, Sparkles, FileText, Image as ImageIcon, Code, Search, X, Command, Zap, Database, Brain, Settings, HelpCircle, Trash2, Download, Play, RefreshCw, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';

/** Action button configuration */
export interface ActionButton {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  tooltip?: string;
}

/** Action area configuration */
export interface ActionArea {
  id: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'inline';
  buttons: ActionButton[];
  layout?: 'horizontal' | 'vertical' | 'grid';
}

/** Command definition */
export interface SlashCommand {
  id: string;
  name: string;
  description: string;
  category?: string;
  examples?: string[];
  icon?: React.ReactNode;
}

export interface PromptInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend?: (value: string, context?: string) => void;
  loading?: boolean;
  showExamples?: boolean;
  maxLength?: number;
  aiModel?: string;
  onModelChange?: (model: string) => void;
  supportedModels?: string[];
  /** Enable codebase context integration */
  enableCodebaseContext?: boolean;
  /** Callback when codebase context is requested */
  onCodebaseContextRequest?: (query: string) => Promise<{ context: string; files: string[] } | null>;
  /** Enable slash commands */
  enableSlashCommands?: boolean;
  /** Available slash commands */
  slashCommands?: SlashCommand[];
  /** Callback when a command is selected */
  onCommandSelect?: (command: SlashCommand) => void;
  /** Callback when a command is executed */
  onCommandExecute?: (commandInput: string) => void;
  /** Action button areas */
  actionAreas?: ActionArea[];
  /** Quick action buttons for the main area */
  quickActions?: ActionButton[];
  /** Show the command palette button */
  showCommandPalette?: boolean;
  /** Callback when command palette is opened */
  onCommandPaletteOpen?: () => void;
}

// Default slash commands for storybook mining
const DEFAULT_SLASH_COMMANDS: SlashCommand[] = [
  { id: 'mine', name: '/mine', description: 'Mine storybooks for training data', category: 'storybook', icon: <Database className="h-4 w-4" /> },
  { id: 'train', name: '/train', description: 'Start training with a pretrained model', category: 'training', icon: <Brain className="h-4 w-4" /> },
  { id: 'models', name: '/models', description: 'List available pretrained models (11 models)', category: 'info', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'status', name: '/status', description: 'Check training or mining status', category: 'info', icon: <RefreshCw className="h-4 w-4" /> },
  { id: 'help', name: '/help', description: 'Show available commands', category: 'info', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'search', name: '/search', description: 'Search components or patterns', category: 'search', icon: <Search className="h-4 w-4" /> },
  { id: 'generate', name: '/generate', description: 'Generate component or story', category: 'generation', icon: <Zap className="h-4 w-4" /> },
  { id: 'workflow', name: '/workflow', description: 'Create or manage workflows', category: 'workflow', icon: <Play className="h-4 w-4" /> },
  { id: 'config', name: '/config', description: 'View or update configuration', category: 'system', icon: <Settings className="h-4 w-4" /> },
  { id: 'clear', name: '/clear', description: 'Clear conversation history', category: 'utility', icon: <Trash2 className="h-4 w-4" /> },
  { id: 'export', name: '/export', description: 'Export training data or components', category: 'utility', icon: <Download className="h-4 w-4" /> },
];

export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({ 
    onSend, 
    loading = false, 
    showExamples = true,
    maxLength = 2000,
    aiModel = 'deepseek-r1',
    onModelChange,
    supportedModels = ['deepseek-r1', 'gpt-4', 'claude-3'],
    enableSlashCommands = true,
    slashCommands = DEFAULT_SLASH_COMMANDS,
    onCommandSelect,
    onCommandExecute,
    actionAreas = [],
    quickActions = [],
    showCommandPalette = true,
    onCommandPaletteOpen,
    className,
    placeholder = 'Type a message or use /commands... (e.g., /mine, /train --model=bert)',
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const commandMenuRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [showCommandMenu, setShowCommandMenu] = useState(false);
    const [commandFilter, setCommandFilter] = useState('');
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value]);

    // Filter commands based on input
    const filteredCommands = useMemo(() => {
      if (!commandFilter) return slashCommands;
      const filter = commandFilter.toLowerCase();
      return slashCommands.filter(cmd => 
        cmd.name.toLowerCase().includes(filter) ||
        cmd.description.toLowerCase().includes(filter) ||
        cmd.category?.toLowerCase().includes(filter)
      );
    }, [commandFilter, slashCommands]);

    // Handle input change with command detection
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        setValue(newValue);
        setCharCount(newValue.length);
        
        // Detect slash commands
        if (enableSlashCommands && newValue.startsWith('/')) {
          const commandPart = newValue.slice(1).split(/\s+/)[0];
          setCommandFilter(commandPart);
          setShowCommandMenu(true);
          setSelectedCommandIndex(0);
        } else {
          setShowCommandMenu(false);
          setCommandFilter('');
        }
      }
    };

    // Handle command selection
    const handleCommandSelect = useCallback((command: SlashCommand) => {
      setValue(command.name + ' ');
      setShowCommandMenu(false);
      setCommandFilter('');
      onCommandSelect?.(command);
      textareaRef.current?.focus();
    }, [onCommandSelect]);

    // Handle send
    const handleSend = useCallback(() => {
      if (value.trim() && !loading) {
        // Check if it's a command
        if (enableSlashCommands && value.trim().startsWith('/')) {
          onCommandExecute?.(value.trim());
        }
        onSend?.(value);
        setValue('');
        setCharCount(0);
        setShowCommandMenu(false);
      }
    }, [value, loading, enableSlashCommands, onCommandExecute, onSend]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showCommandMenu && filteredCommands.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedCommandIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedCommandIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleCommandSelect(filteredCommands[selectedCommandIndex]);
        } else if (e.key === 'Escape') {
          setShowCommandMenu(false);
        }
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    };

    // Close command menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (commandMenuRef.current && !commandMenuRef.current.contains(e.target as Node)) {
          setShowCommandMenu(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const examplePrompts = [
      '/mine - Mine storybook data',
      '/train --model=bert - Train a model',
      '/models - List 11 pretrained models',
    ];

    // Render action area
    const renderActionArea = (area: ActionArea) => {
      const layoutClasses = {
        horizontal: 'flex flex-row gap-2',
        vertical: 'flex flex-col gap-2',
        grid: 'grid grid-cols-2 gap-2'
      };

      return (
        <div key={area.id} className={cn(layoutClasses[area.layout || 'horizontal'])}>
          {area.buttons.map(button => (
            <button
              key={button.id}
              onClick={button.onClick}
              disabled={button.disabled}
              title={button.tooltip}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                button.variant === 'primary' && 'bg-primary text-on-primary hover:bg-primary/90',
                button.variant === 'secondary' && 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80',
                button.variant === 'outline' && 'border border-outline text-on-surface hover:bg-surface-container',
                button.variant === 'ghost' && 'text-on-surface-variant hover:bg-surface-container-highest',
                button.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {button.icon}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
      );
    };

    // Get action areas by position
    const topActionArea = actionAreas.find(a => a.position === 'top');
    const bottomActionArea = actionAreas.find(a => a.position === 'bottom');
    const leftActionArea = actionAreas.find(a => a.position === 'left');
    const rightActionArea = actionAreas.find(a => a.position === 'right');
    const inlineActionArea = actionAreas.find(a => a.position === 'inline');

    return (
      <div className="w-full space-y-4">
        {/* Top action area */}
        {topActionArea && (
          <div className="flex justify-center">
            {renderActionArea(topActionArea)}
          </div>
        )}

        {/* Example prompts / Commands */}
        {showExamples && value.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
              <Command className="h-3 w-3" />
              Quick commands:
            </p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setValue(example.split(' - ')[0] + ' ')}
                  className="text-left text-xs rounded-full border border-outline px-3 py-1.5 hover:bg-surface-container-highest transition-colors text-on-surface-variant hover:text-on-surface flex items-center gap-1"
                >
                  <Zap className="h-3 w-3" />
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {/* Left action area */}
          {leftActionArea && (
            <div className="flex-shrink-0">
              {renderActionArea(leftActionArea)}
            </div>
          )}

          {/* Main prompt box */}
          <div className="relative flex-1 rounded-3xl border-2 border-outline bg-surface shadow-level-1 focus-within:border-primary focus-within:shadow-level-2 transition-all">
            {/* Command menu dropdown */}
            {showCommandMenu && filteredCommands.length > 0 && (
              <div 
                ref={commandMenuRef}
                className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-outline rounded-xl shadow-level-3 max-h-64 overflow-y-auto z-50"
              >
                <div className="p-2">
                  <p className="text-xs text-on-surface-variant font-medium px-2 py-1">
                    Commands ({filteredCommands.length})
                  </p>
                  {filteredCommands.map((cmd, index) => (
                    <button
                      key={cmd.id}
                      onClick={() => handleCommandSelect(cmd)}
                      className={cn(
                        'w-full flex items-start gap-3 p-2 rounded-lg text-left transition-colors',
                        index === selectedCommandIndex 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-surface-container-highest'
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5 text-on-surface-variant">
                        {cmd.icon || <Command className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{cmd.name}</div>
                        <div className="text-xs text-on-surface-variant truncate">{cmd.description}</div>
                      </div>
                      {cmd.category && (
                        <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                          {cmd.category}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              ref={(node) => {
                textareaRef.current = node;
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
              }}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={loading}
              className={cn(
                'w-full resize-none bg-transparent px-6 py-4 text-base text-on-surface placeholder:text-on-surface-variant',
                'focus:outline-none min-h-[120px] max-h-[400px]',
                'overflow-y-auto',
                className
              )}
              {...props}
            />

            {/* Inline action area */}
            {inlineActionArea && (
              <div className="px-4 pb-2">
                {renderActionArea(inlineActionArea)}
              </div>
            )}

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between border-t border-outline-variant px-4 py-3">
              <div className="flex items-center gap-2">
                {/* Command palette button */}
                {showCommandPalette && (
                  <button
                    onClick={() => {
                      setShowCommandMenu(true);
                      onCommandPaletteOpen?.();
                    }}
                    className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant transition-colors"
                    title="Open command palette (type /)"
                  >
                    <Command className="h-4 w-4" />
                  </button>
                )}

                {/* Model selector */}
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <Sparkles className="h-4 w-4" />
                  <select
                    value={aiModel}
                    onChange={(e) => onModelChange?.(e.target.value)}
                    className="bg-transparent border border-outline rounded-lg px-2 py-1 text-on-surface focus:outline-none focus:border-primary"
                    disabled={loading}
                  >
                    {supportedModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick actions */}
                {quickActions.length > 0 && (
                  <div className="flex items-center gap-1 border-l border-outline-variant pl-2 ml-1">
                    {quickActions.slice(0, 3).map(action => (
                      <button
                        key={action.id}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        title={action.tooltip || action.label}
                        className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant transition-colors disabled:opacity-50"
                      >
                        {action.icon}
                      </button>
                    ))}
                    {quickActions.length > 3 && (
                      <button className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Attachment buttons */}
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed"
                    title="Attach file (coming soon)"
                    disabled
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed"
                    title="Attach image (coming soon)"
                    disabled
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Character count */}
                <span className={cn(
                  'text-xs',
                  charCount > maxLength * 0.9 ? 'text-warning' : 'text-on-surface-variant'
                )}>
                  {charCount}/{maxLength}
                </span>

                {/* Send button */}
                <Button
                  variant="filled"
                  size="sm"
                  onClick={handleSend}
                  disabled={!value.trim() || loading}
                  isLoading={loading}
                  className="gap-2"
                >
                  {loading ? 'Processing...' : value.startsWith('/') ? 'Execute' : 'Send'}
                  {value.startsWith('/') ? <Zap className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Right action area */}
          {rightActionArea && (
            <div className="flex-shrink-0">
              {renderActionArea(rightActionArea)}
            </div>
          )}
        </div>

        {/* Bottom action area */}
        {bottomActionArea && (
          <div className="flex justify-center">
            {renderActionArea(bottomActionArea)}
          </div>
        )}

        {/* Keyboard hints */}
        <div className="flex items-center justify-center gap-4 text-xs text-on-surface-variant">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline text-xs">
              /
            </kbd>{' '}
            for commands
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline text-xs">
              {typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator?.platform?.includes?.('Mac') ? '⌘' : 'Ctrl'}+Enter
            </kbd>{' '}
            to send
          </span>
        </div>
      </div>
    );
  }
);

PromptInput.displayName = 'PromptInput';

export default PromptInput;
