import { cn } from '@/lib/utils';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface TryAgainControlProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Available AI models to select from */
  models?: Array<{ id: string; name: string; description?: string }>;
  /** Currently selected model */
  selectedModel?: string;
  /** Callback when trying again with same model */
  onRetry?: () => void;
  /** Callback when trying again with different model */
  onRetryWithModel?: (modelId: string) => void;
  /** Show model selection dropdown */
  showModelSelector?: boolean;
  /** Size of the control */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  isLoading?: boolean;
}

const DEFAULT_MODELS = [
  { id: 'deepseek-r1', name: 'DeepSeek R1', description: 'Advanced reasoning model' },
  { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI flagship model' },
  { id: 'claude-3', name: 'Claude 3', description: 'Anthropic model' },
  { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google AI model' },
];

export const TryAgainControl = ({
  models = DEFAULT_MODELS,
  selectedModel,
  onRetry,
  onRetryWithModel,
  showModelSelector = true,
  size = 'md',
  isLoading = false,
  className,
  ...props
}: TryAgainControlProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handleRetry = () => {
    if (isLoading) return;
    onRetry?.();
  };

  const handleRetryWithModel = (modelId: string) => {
    if (isLoading) return;
    setShowDropdown(false);
    onRetryWithModel?.(modelId);
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <button
        onClick={handleRetry}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200',
          'border border-outline bg-surface hover:bg-surface-container-highest',
          'text-on-surface hover:shadow-sm',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size]
        )}
        title="Try again"
        aria-label="Try again"
        {...props}
      >
        <RefreshCw
          className={cn(
            iconSizeClasses[size],
            isLoading && 'animate-spin'
          )}
        />
        <span>Try Again</span>
      </button>

      {showModelSelector && (
        <>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isLoading}
            className={cn(
              'ml-1 rounded-lg px-2 py-1.5 transition-all duration-200',
              'border border-outline bg-surface hover:bg-surface-container-highest',
              'text-on-surface-variant hover:text-on-surface',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Select different model"
            aria-label="Select different model"
            aria-expanded={showDropdown}
          >
            <ChevronDown
              className={cn(
                iconSizeClasses[size],
                'transition-transform duration-200',
                showDropdown && 'rotate-180'
              )}
            />
          </button>

          {showDropdown && (
            <div
              className={cn(
                'absolute top-full right-0 mt-2 z-50',
                'min-w-[240px] rounded-xl shadow-lg',
                'bg-surface-container border border-outline',
                'overflow-hidden'
              )}
            >
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-on-surface-variant">
                  Try with different model
                </div>
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleRetryWithModel(model.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg',
                      'hover:bg-surface-container-highest transition-colors',
                      'group'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div
                          className={cn(
                            'font-medium text-sm',
                            selectedModel === model.id
                              ? 'text-primary'
                              : 'text-on-surface'
                          )}
                        >
                          {model.name}
                        </div>
                        {model.description && (
                          <div className="text-xs text-on-surface-variant mt-0.5">
                            {model.description}
                          </div>
                        )}
                      </div>
                      {selectedModel === model.id && (
                        <div className="ml-2 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

TryAgainControl.displayName = 'TryAgainControl';
