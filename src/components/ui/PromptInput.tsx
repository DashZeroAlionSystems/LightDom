import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Send, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

export interface PromptInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend?: (value: string) => void;
  loading?: boolean;
  showExamples?: boolean;
  maxLength?: number;
  aiModel?: string;
  onModelChange?: (model: string) => void;
  supportedModels?: string[];
}

export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({ 
    onSend, 
    loading = false, 
    showExamples = true,
    maxLength = 2000,
    aiModel = 'deepseek-r1',
    onModelChange,
    supportedModels = ['deepseek-r1', 'gpt-4', 'claude-3'],
    className,
    placeholder = 'Describe your workflow... (e.g., "I want to mine data from tech blogs and analyze their SEO strategies")',
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = React.useState('');
    const [charCount, setCharCount] = React.useState(0);

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        setValue(newValue);
        setCharCount(newValue.length);
      }
    };

    const handleSend = () => {
      if (value.trim() && !loading) {
        onSend?.(value);
        setValue('');
        setCharCount(0);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    };

    const examplePrompts = [
      'Create a data mining workflow for competitor analysis',
      'Build an SEO optimization pipeline with content generation',
      'Set up automated social media monitoring and reporting',
    ];

    return (
      <div className="w-full space-y-4">
        {/* Example prompts */}
        {showExamples && value.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-on-surface-variant font-medium">Example prompts:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setValue(example)}
                  className="text-left text-xs rounded-full border border-outline px-3 py-1.5 hover:bg-surface-container-highest transition-colors text-on-surface-variant hover:text-on-surface"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main prompt box */}
        <div className="relative rounded-3xl border-2 border-outline bg-surface shadow-level-1 focus-within:border-primary focus-within:shadow-level-2 transition-all">
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

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between border-t border-outline-variant px-4 py-3">
            <div className="flex items-center gap-2">
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

              {/* Attachment buttons (not implemented) */}
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed"
                  title="Attach file (not implemented)"
                  disabled
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed"
                  title="Attach image (not implemented)"
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
                {loading ? 'Generating...' : 'Send'}
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-on-surface-variant text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline text-xs">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
          </kbd> to send
        </p>
      </div>
    );
  }
);

PromptInput.displayName = 'PromptInput';

export default PromptInput;
