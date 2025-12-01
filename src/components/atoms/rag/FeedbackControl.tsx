import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { HTMLAttributes } from 'react';

export type FeedbackValue = 'positive' | 'negative' | null;
export type FeedbackStrength = 1 | 2 | 3 | 4 | 5;

export interface FeedbackData {
  value: FeedbackValue;
  strength?: FeedbackStrength;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface FeedbackControlProps extends HTMLAttributes<HTMLDivElement> {
  /** Initial feedback value */
  value?: FeedbackValue;
  /** Initial feedback strength (1-5) */
  strength?: FeedbackStrength;
  /** Callback when feedback changes */
  onChange?: (data: FeedbackData) => void;
  /** Size of the controls */
  size?: 'sm' | 'md' | 'lg';
  /** Show labels on buttons */
  showLabels?: boolean;
  /** Enable strength selection (1-5 stars/levels) */
  enableStrength?: boolean;
  /** Enable reason input */
  enableReason?: boolean;
  /** Allow reselection (clicking again can modify) */
  allowReselect?: boolean;
  /** Disable controls */
  disabled?: boolean;
  /** Session ID for backend integration */
  sessionId?: string;
  /** Conversation ID for backend integration */
  conversationId?: string;
  /** Message ID for backend integration */
  messageId?: string;
  /** Prompt text (for context) */
  prompt?: string;
  /** Response text (for context) */
  response?: string;
  /** Model used (for learning) */
  modelUsed?: string;
  /** Template style (for learning) */
  templateStyle?: string;
  /** Auto-submit feedback to backend */
  autoSubmit?: boolean;
  /** Backend API endpoint */
  apiEndpoint?: string;
}

export const FeedbackControl = ({
  value: initialValue,
  strength: initialStrength,
  onChange,
  size = 'md',
  showLabels = false,
  enableStrength = false,
  enableReason = false,
  allowReselect = true,
  disabled = false,
  sessionId,
  conversationId,
  messageId,
  prompt,
  response,
  modelUsed,
  templateStyle,
  autoSubmit = false,
  apiEndpoint = '/api/feedback',
  className,
  ...props
}: FeedbackControlProps) => {
  const [value, setValue] = useState<FeedbackValue>(initialValue || null);
  const [strength, setStrength] = useState<FeedbackStrength>(initialStrength || 3);
  const [reason, setReason] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  };

  // Submit feedback to backend when autoSubmit is enabled
  useEffect(() => {
    if (autoSubmit && value && sessionId && conversationId && messageId) {
      submitFeedback();
    }
  }, [value, strength, reason]);

  const handleFeedback = (newValue: 'positive' | 'negative') => {
    if (disabled) return;
    
    // Toggle off if clicking the same value (if allowReselect is true)
    // Or show details panel if already selected (for modification)
    if (value === newValue) {
      if (allowReselect) {
        if (enableStrength || enableReason) {
          setShowDetails(!showDetails);
        } else {
          const finalValue = null;
          setValue(finalValue);
          notifyChange(finalValue, strength, reason);
        }
      } else {
        setShowDetails(true); // Allow viewing/modifying details
      }
    } else {
      setValue(newValue);
      if (enableStrength || enableReason) {
        setShowDetails(true);
      }
      notifyChange(newValue, strength, reason);
    }
  };

  const handleStrengthChange = (newStrength: FeedbackStrength) => {
    setStrength(newStrength);
    notifyChange(value, newStrength, reason);
  };

  const handleReasonChange = (newReason: string) => {
    setReason(newReason);
    notifyChange(value, strength, newReason);
  };

  const notifyChange = (
    feedbackValue: FeedbackValue,
    feedbackStrength: FeedbackStrength,
    feedbackReason: string
  ) => {
    const data: FeedbackData = {
      value: feedbackValue,
      strength: feedbackStrength,
      reason: feedbackReason || undefined,
      metadata: {
        sessionId,
        conversationId,
        messageId,
        modelUsed,
        templateStyle,
      },
    };
    onChange?.(data);
  };

  const submitFeedback = async () => {
    if (!value || !sessionId || !conversationId || !messageId) return;

    setIsSubmitting(true);
    try {
      const payload = {
        sessionId,
        conversationId,
        messageId,
        feedbackType: value,
        feedbackStrength: strength,
        feedbackReason: reason || null,
        prompt: prompt || '',
        response: response || '',
        modelUsed,
        templateStyle,
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      };

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('Failed to submit feedback:', await res.text());
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
  };

  return (
    <div
      className={cn('relative flex flex-col gap-2', className)}
      role="group"
      aria-label="Provide feedback"
      {...props}
    >
      {/* Main feedback buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleFeedback('positive')}
          disabled={disabled || isSubmitting}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg transition-all duration-200',
            'hover:bg-surface-container-highest',
            value === 'positive'
              ? 'text-success bg-success/10 ring-2 ring-success/30'
              : 'text-on-surface-variant hover:text-on-surface',
            disabled && 'opacity-50 cursor-not-allowed',
            isSubmitting && 'opacity-70 cursor-wait',
            buttonSizeClasses[size]
          )}
          title="Good response"
          aria-label="Good response"
          aria-pressed={value === 'positive'}
        >
          <ThumbsUp
            className={cn(
              sizeClasses[size],
              value === 'positive' && 'fill-current'
            )}
          />
          {showLabels && <span className="font-medium">Good</span>}
        </button>

        <button
          onClick={() => handleFeedback('negative')}
          disabled={disabled || isSubmitting}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg transition-all duration-200',
            'hover:bg-surface-container-highest',
            value === 'negative'
              ? 'text-error bg-error/10 ring-2 ring-error/30'
              : 'text-on-surface-variant hover:text-on-surface',
            disabled && 'opacity-50 cursor-not-allowed',
            isSubmitting && 'opacity-70 cursor-wait',
            buttonSizeClasses[size]
          )}
          title="Bad response"
          aria-label="Bad response"
          aria-pressed={value === 'negative'}
        >
          <ThumbsDown
            className={cn(
              sizeClasses[size],
              value === 'negative' && 'fill-current'
            )}
          />
          {showLabels && <span className="font-medium">Bad</span>}
        </button>

        {/* Show details toggle when feedback is provided */}
        {value && (enableStrength || enableReason) && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg transition-all duration-200',
              'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest',
              showDetails && 'bg-surface-container-highest',
              buttonSizeClasses[size]
            )}
            title="Add details"
            aria-label="Add details"
          >
            <MessageSquare className={sizeClasses[size]} />
          </button>
        )}

        {isSubmitting && (
          <span className="text-xs text-on-surface-variant ml-2">
            Saving...
          </span>
        )}
      </div>

      {/* Details panel */}
      {showDetails && value && (
        <div className="bg-surface-container border border-outline rounded-lg p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Close button */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface">
              {value === 'positive' ? 'Tell us what worked well' : 'Help us improve'}
            </span>
            <button
              onClick={closeDetails}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded"
              aria-label="Close details"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Strength selector */}
          {enableStrength && (
            <div className="space-y-2">
              <label className="text-xs text-on-surface-variant">
                How strongly do you feel?
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleStrengthChange(level as FeedbackStrength)}
                    className={cn(
                      'flex-1 h-8 rounded transition-all duration-150',
                      strength >= level
                        ? value === 'positive'
                          ? 'bg-success text-white'
                          : 'bg-error text-white'
                        : 'bg-surface-container-low border border-outline hover:border-outline-variant',
                      'hover:scale-105'
                    )}
                    aria-label={`Strength level ${level}`}
                  >
                    <span className="text-xs font-medium">{level}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Weak</span>
                <span>Strong</span>
              </div>
            </div>
          )}

          {/* Reason input */}
          {enableReason && (
            <div className="space-y-2">
              <label className="text-xs text-on-surface-variant">
                What's the reason? (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                placeholder="Share your thoughts..."
                className={cn(
                  'w-full min-h-[60px] px-3 py-2 text-sm rounded-lg',
                  'bg-surface border border-outline',
                  'text-on-surface placeholder:text-on-surface-variant',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'resize-none'
                )}
                maxLength={500}
              />
              <div className="text-xs text-on-surface-variant text-right">
                {reason.length}/500
              </div>
            </div>
          )}

          {/* Submit button (if not auto-submit) */}
          {!autoSubmit && (
            <button
              onClick={submitFeedback}
              disabled={isSubmitting}
              className={cn(
                'w-full py-2 px-4 rounded-lg text-sm font-medium',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

FeedbackControl.displayName = 'FeedbackControl';
