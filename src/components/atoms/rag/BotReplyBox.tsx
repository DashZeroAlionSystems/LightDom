import { cn } from '@/lib/utils';
import { Bot, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { ReactNode, HTMLAttributes } from 'react';
import { CopyControl } from './CopyControl';
import { FeedbackControl, type FeedbackValue } from './FeedbackControl';
import { TryAgainControl } from './TryAgainControl';
import { BusyIndicator } from './BusyIndicator';

export type ReplyStatus = 'success' | 'error' | 'pending' | 'processing' | 'warning';

export interface BotReplyBoxProps extends HTMLAttributes<HTMLDivElement> {
  /** Status of the reply */
  status?: ReplyStatus;
  /** Main reply content */
  content: ReactNode;
  /** Repository or task location info */
  location?: {
    repo?: string;
    task?: string;
    branch?: string;
  };
  /** List items or categories to display */
  listItems?: Array<{
    id: string;
    label: string;
    description?: string;
    icon?: ReactNode;
  }>;
  /** Show feedback controls */
  showFeedback?: boolean;
  /** Show copy control */
  showCopy?: boolean;
  /** Show try again control */
  showTryAgain?: boolean;
  /** Callback for feedback */
  onFeedback?: (value: FeedbackValue) => void;
  /** Callback for copy */
  onCopy?: () => void;
  /** Callback for retry */
  onRetry?: () => void;
  /** Callback for retry with model */
  onRetryWithModel?: (modelId: string) => void;
  /** Bot icon to display */
  botIcon?: ReactNode;
  /** Custom title instead of status-based title */
  title?: string;
  /** Show busy indicator when processing */
  isProcessing?: boolean;
  /** Processing message */
  processingMessage?: string;
}

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
    title: 'Success',
  },
  error: {
    icon: XCircle,
    color: 'text-error',
    bgColor: 'bg-error/10',
    title: 'Error',
  },
  pending: {
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    title: 'Pending',
  },
  processing: {
    icon: Clock,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    title: 'Processing',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    title: 'Warning',
  },
};

export const BotReplyBox = ({
  status = 'success',
  content,
  location,
  listItems,
  showFeedback = true,
  showCopy = true,
  showTryAgain = true,
  onFeedback,
  onCopy,
  onRetry,
  onRetryWithModel,
  botIcon,
  title,
  isProcessing = false,
  processingMessage,
  className,
  ...props
}: BotReplyBoxProps) => {
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const contentAsString =
    typeof content === 'string' ? content : JSON.stringify(content);

  return (
    <div
      className={cn(
        'rounded-xl bg-surface border border-outline shadow-sm',
        'transition-all duration-200',
        className
      )}
      role="article"
      aria-label="Bot reply"
      {...props}
    >
      {/* Header with bot icon and status */}
      <div className="flex items-start gap-3 p-4 border-b border-outline">
        <div className="flex-shrink-0">
          {botIcon || (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Status and title */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                statusConfig.bgColor,
                statusConfig.color
              )}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              <span>{title || statusConfig.title}</span>
            </div>
          </div>

          {/* Location info */}
          {location && (
            <div className="text-xs text-on-surface-variant mt-1 space-y-0.5">
              {location.repo && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Repo:</span>
                  <span className="font-mono">{location.repo}</span>
                </div>
              )}
              {location.task && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Task:</span>
                  <span>{location.task}</span>
                </div>
              )}
              {location.branch && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Branch:</span>
                  <span className="font-mono">{location.branch}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="p-4">
        {isProcessing ? (
          <BusyIndicator
            variant="dots"
            message={processingMessage || 'Processing your request...'}
            size="md"
          />
        ) : (
          <div className="text-on-surface prose prose-sm max-w-none">
            {content}
          </div>
        )}

        {/* List items / categories */}
        {listItems && listItems.length > 0 && !isProcessing && (
          <div className="mt-4 space-y-2">
            {listItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-2 p-3 rounded-lg',
                  'bg-surface-container hover:bg-surface-container-highest',
                  'transition-colors duration-200'
                )}
              >
                {item.icon && (
                  <div className="flex-shrink-0 text-on-surface-variant mt-0.5">
                    {item.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-on-surface">{item.label}</div>
                  {item.description && (
                    <div className="text-sm text-on-surface-variant mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with controls */}
      {!isProcessing && (
        <div className="flex items-center justify-between gap-3 p-4 border-t border-outline bg-surface-container/30">
          <div className="flex items-center gap-2">
            {showFeedback && (
              <FeedbackControl
                onChange={onFeedback}
                size="sm"
              />
            )}
            {showCopy && (
              <CopyControl
                content={contentAsString}
                variant="both"
                size="sm"
                onCopySuccess={onCopy}
              />
            )}
          </div>

          {showTryAgain && (
            <TryAgainControl
              onRetry={onRetry}
              onRetryWithModel={onRetryWithModel}
              size="sm"
            />
          )}
        </div>
      )}
    </div>
  );
};

BotReplyBox.displayName = 'BotReplyBox';
