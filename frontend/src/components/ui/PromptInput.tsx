import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  Paperclip,
  Mic,
  Command,
  MessageCircle,
  Send,
  Loader2,
  User
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  PromptComposeAction,
  PromptComposeHeader,
  PromptComposeInput,
  PromptComposeShell,
  PromptComposeToolbar,
  PromptComposeToken
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
}

const defaultTokens: PromptToken[] = [
  { id: 'workspace', label: 'AI Workspace', icon: <Sparkles className="w-3.5 h-3.5" />, tone: 'accent' },
  { id: 'docs', label: 'Documents' },
  { id: 'sheets', label: 'Sheets' }
];

const defaultActions: PromptAction[] = [
  { id: 'attach', icon: <Paperclip className="w-4 h-4" />, label: 'Attach files' },
  { id: 'voice', icon: <Mic className="w-4 h-4" />, label: 'Start voice' },
  { id: 'commands', icon: <Command className="w-4 h-4" />, label: 'Commands' }
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
  maxRows = 10
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInternalValue(defaultValue);
  }, [defaultValue]);

  const currentValue = value ?? internalValue;

  const resolvedTokens = useMemo(() => tokens ?? defaultTokens, [tokens]);
  const resolvedActions = useMemo(() => actions ?? defaultActions, [actions]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      if (maxLength && nextValue.length > maxLength) {
        return;
      }
      setInternalValue(nextValue);
      onChange?.(nextValue);
    },
    [maxLength, onChange]
  );

  const triggerSend = useCallback(async () => {
    if (!currentValue.trim() || loading || disabled) return;
    await onSend?.(currentValue.trim());
    setInternalValue('');
    onChange?.('');
  }, [currentValue, disabled, loading, onChange, onSend]);

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.key === 'Enter' && (event.metaKey || event.ctrlKey)) || (event.key === 'Enter' && event.shiftKey === false)) {
        event.preventDefault();
        await triggerSend();
      }
    },
    [triggerSend]
  );

  const headerConfig: PromptInputHeaderConfig = useMemo(
    () => ({
      title: header?.title ?? 'Agent',
      subtitle: header?.subtitle ?? 'AI Developer',
      leading:
        header?.leading ?? (
          <div className="flex items-center gap-2 text-on-surface">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Agent</span>
              <span className="text-xs text-on-surface-variant">AI Developer</span>
            </div>
          </div>
        ),
      trailing:
        header?.trailing ?? (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant/80">
            <MessageCircle className="h-3.5 w-3.5" />
            Live Collaboration
          </div>
        )
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
          density="relaxed"
        />
      }
      toolbar={
        <PromptComposeToolbar className="justify-between pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {resolvedTokens.map((token) => (
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
          <div className="flex items-center gap-2">
            {resolvedActions.map((action) => (
              <PromptComposeAction
                key={action.id}
                icon={action.icon}
                label={action.label}
                active={action.active}
                onClick={action.onClick}
              />
            ))}
            <button
              type="button"
              onClick={triggerSend}
              disabled={disabled || loading || !currentValue.trim()}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/50 bg-primary text-on-primary transition-all duration-150',
                'disabled:cursor-not-allowed disabled:border-outline/40 disabled:bg-surface-container-high disabled:text-on-surface-variant'
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </PromptComposeToolbar>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant/70">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            {helperText ?? 'Tip: Use @, #, and / to reference data, commands, or workflows.'}
          </div>
          <div className="flex items-center gap-4">
            {usage}
            {characterCount && <span className="font-medium text-on-surface">{characterCount}</span>}
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
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        minRows={minRows}
        maxRows={maxRows}
        aria-label={placeholder}
      />
    </PromptComposeShell>
  );
};

export default PromptInput;
