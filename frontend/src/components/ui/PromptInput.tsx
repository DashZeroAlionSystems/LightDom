import { Loader2, MessageCircle, Send, Sparkles, User } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import {
  PromptComposeAction,
  PromptComposeHeader,
  PromptComposeInput,
  PromptComposeShell,
  PromptComposeToken,
  PromptComposeToolbar,
} from './PromptCompose';

export interface PromptAction {
  id: string;
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface PromptToken {
  id: string;
  label: string;
  tone?: 'default' | 'accent' | 'warning';
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface PromptInputHeaderConfig {
  title?: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export interface PromptInputProps {
  placeholder?: string;
  onSend?: (value: string) => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  tokens?: PromptToken[];
  actions?: PromptAction[];
  header?: PromptInputHeaderConfig;
  helperText?: React.ReactNode;
  usage?: React.ReactNode;
  maxLength?: number;
  className?: string;
  minRows?: number;
  maxRows?: number;
  allowSendWhileLoading?: boolean;
  textColor?: string;
  slashCommands?: Array<{ command: string; description: string }>;
}

const defaultTokens: PromptToken[] = [
  {
    id: 'workspace',
    label: 'AI Workspace',
    icon: <Sparkles className='w-3.5 h-3.5' />,
    tone: 'accent',
  },
  { id: 'docs', label: 'Documents' },
  { id: 'sheets', label: 'Sheets' },
];

export const PromptInput: React.FC<PromptInputProps> = ({
  placeholder = 'Describe the workflow or request…',
  onSend,
  loading = false,
  disabled = false,
  defaultValue = '',
  value,
  onChange,
  tokens,
  actions,
  header,
  helperText,
  usage,
  maxLength,
  className,
  minRows = 4,
  maxRows = 10,
  allowSendWhileLoading = false,
  textColor,
  slashCommands = [],
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [showSlashDropdown, setShowSlashDropdown] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  useEffect(() => {
    setInternalValue(defaultValue);
  }, [defaultValue]);

  const currentValue = value ?? internalValue;

  const resolvedTokens = useMemo(() => tokens ?? defaultTokens, [tokens]);
  const resolvedActions = useMemo(() => actions ?? [], [actions]);

  // Filter slash commands based on current input
  const filteredSlashCommands = useMemo(() => {
    if (!currentValue.startsWith('/')) return [];
    const query = currentValue.slice(1).toLowerCase();
    if (!query) return slashCommands;
    return slashCommands.filter(
      cmd =>
        cmd.command.toLowerCase().includes(query) || cmd.description.toLowerCase().includes(query)
    );
  }, [currentValue, slashCommands]);

  // Reset selected index when filtered commands change
  useEffect(() => {
    if (filteredSlashCommands.length > 0) {
      setSelectedCommandIndex(0);
    }
  }, [filteredSlashCommands.length]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      if (maxLength && nextValue.length > maxLength) {
        return;
      }
      setInternalValue(nextValue);
      onChange?.(nextValue);

      // Show and filter slash command dropdown when typing "/"
      if (nextValue.startsWith('/') && slashCommands.length > 0) {
        setShowSlashDropdown(true);
        setSelectedCommandIndex(0);
      } else {
        setShowSlashDropdown(false);
      }
    },
    [maxLength, onChange, slashCommands.length]
  );

  const triggerSend = useCallback(async () => {
    if (!currentValue.trim() || disabled) return;
    if (loading && !allowSendWhileLoading) return;
    await onSend?.(currentValue.trim());
    setInternalValue('');
    onChange?.('');
  }, [allowSendWhileLoading, currentValue, disabled, loading, onChange, onSend]);

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showSlashDropdown && filteredSlashCommands.length > 0) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setSelectedCommandIndex(prev =>
              prev < filteredSlashCommands.length - 1 ? prev + 1 : prev
            );
            return;
          case 'ArrowUp':
            event.preventDefault();
            setSelectedCommandIndex(prev => (prev > 0 ? prev - 1 : prev));
            return;
          case 'Enter':
            event.preventDefault();
            if (filteredSlashCommands[selectedCommandIndex]) {
              const command = filteredSlashCommands[selectedCommandIndex].command;
              setInternalValue(command);
              onChange?.(command);
              setShowSlashDropdown(false);
            }
            return;
          case 'Escape':
            event.preventDefault();
            setShowSlashDropdown(false);
            return;
        }
      }

      if (
        (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) ||
        (event.key === 'Enter' && event.shiftKey === false)
      ) {
        event.preventDefault();
        await triggerSend();
      }
    },
    [showSlashDropdown, filteredSlashCommands, selectedCommandIndex, triggerSend, onChange]
  );

  const headerConfig: PromptInputHeaderConfig = useMemo(
    () => ({
      title: header?.title ?? 'Agent',
      subtitle: header?.subtitle ?? 'AI Developer',
      leading: header?.leading ?? (
        <div className='flex items-center gap-2 text-on-surface'>
          <div className='flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <Sparkles className='h-4 w-4' />
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-semibold'>Agent</span>
            <span className='text-xs text-on-surface-variant'>AI Developer</span>
          </div>
        </div>
      ),
      trailing: header?.trailing ?? (
        <div className='flex items-center gap-2 text-xs text-on-surface-variant/80'>
          <MessageCircle className='h-3.5 w-3.5' />
          Live Collaboration
        </div>
      ),
    }),
    [header]
  );

  const characterCount = maxLength ? `${currentValue.length}/${maxLength}` : undefined;

  return (
    <PromptComposeShell
      className={cn('bg-surface-container-high/95 backdrop-blur', className)}
      focused={isFocused}
      disabled={disabled}
      header={
        <PromptComposeHeader
          leading={headerConfig.leading}
          trailing={headerConfig.trailing}
          density='relaxed'
        />
      }
      toolbar={
        <PromptComposeToolbar className='justify-between pt-2'>
          <div className='flex flex-wrap items-center gap-2'>
            {resolvedTokens.map(token => (
              <PromptComposeToken
                key={token.id}
                tone={token.tone}
                icon={token.icon}
                onClick={token.onClick}
              >
                {token.label}
              </PromptComposeToken>
            ))}
          </div>
          <div className='flex items-center gap-2'>
            {resolvedActions.map(action => (
              <PromptComposeAction
                key={action.id}
                icon={action.icon}
                label={action.label}
                active={action.active}
                onClick={action.onClick}
                disabled={disabled || (loading && !allowSendWhileLoading && action.id !== 'cancel')}
              />
            ))}
            <button
              type='button'
              onClick={triggerSend}
              disabled={disabled || !currentValue.trim() || (loading && !allowSendWhileLoading)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/50 bg-primary text-on-primary transition-all duration-150',
                'disabled:cursor-not-allowed disabled:border-outline/40 disabled:bg-surface-container-high disabled:text-on-surface-variant'
              )}
            >
              {loading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
            </button>
          </div>
        </PromptComposeToolbar>
      }
      footer={
        <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant/70'>
          <div className='flex items-center gap-2'>
            <User className='h-3.5 w-3.5' />
            {helperText ?? 'Tip: Use @, #, and / to reference data, commands, or workflows.'}
          </div>
          <div className='flex items-center gap-4'>
            {usage}
            {characterCount && (
              <span className='font-medium text-on-surface'>{characterCount}</span>
            )}
          </div>
        </div>
      }
    >
      <PromptComposeInput
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // Delay hiding dropdown to allow clicks
          setTimeout(() => setShowSlashDropdown(false), 150);
          setIsFocused(false);
        }}
        disabled={disabled}
        minRows={minRows}
        maxRows={maxRows}
        textColor={textColor}
        aria-label={placeholder}
      />

      {/* Slash command dropdown */}
      {showSlashDropdown && filteredSlashCommands.length > 0 && (
        <div 
          className='absolute bottom-full left-0 right-0 mb-2 rounded-2xl shadow-lg max-h-64 overflow-y-auto z-50'
          style={{
            backgroundColor: 'var(--command-palette-bg, rgba(28, 28, 35, 0.98))',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--command-palette-border, rgba(255, 255, 255, 0.1))',
            boxShadow: '0 8px 32px var(--command-palette-shadow, rgba(0, 0, 0, 0.5))',
          }}
        >
          <div className='p-2'>
            <div 
              className='text-xs font-semibold uppercase tracking-wide mb-2 px-2'
              style={{ color: 'var(--command-palette-header, rgba(255, 255, 255, 0.5))' }}
            >
              Available Commands{' '}
              {filteredSlashCommands.length < slashCommands.length &&
                `(${filteredSlashCommands.length} of ${slashCommands.length})`}
            </div>
            {filteredSlashCommands.map((cmd, index) => (
              <button
                key={cmd.command}
                type='button'
                onClick={() => {
                  setInternalValue(cmd.command);
                  onChange?.(cmd.command);
                  setShowSlashDropdown(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors duration-150',
                  index === selectedCommandIndex
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'hover:bg-white/5 text-on-surface'
                )}
                style={
                  index === selectedCommandIndex
                    ? { backgroundColor: 'var(--command-palette-selected, rgba(88, 101, 242, 0.2))' }
                    : undefined
                }
              >
                <div className='font-medium'>{cmd.command}</div>
                <div 
                  className='text-xs mt-1'
                  style={{ color: 'var(--command-palette-description, rgba(255, 255, 255, 0.6))' }}
                >
                  {cmd.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </PromptComposeShell>
  );
};

export default PromptInput;
