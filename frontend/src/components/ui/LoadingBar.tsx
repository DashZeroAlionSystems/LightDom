import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type LoaderVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'info';

type Rhythm = 'steady' | 'pulse' | 'wave';

export interface LoadingBarProps {
  /** Optional className for the container */
  className?: string;
  /** Label displayed above the progress line */
  label?: string;
  /** Current progress between 0 and 100. If omitted the bar animates rhythmically. */
  progress?: number;
  /** When true the component shows a "Complete" badge once progress hits 100. */
  showCompletionBadge?: boolean;
  /** Visual style variant, aligned with MD3 palette tokens */
  variant?: LoaderVariant;
  /** Animation rhythm used when progress is not provided */
  rhythm?: Rhythm;
  /** Accessible description of the loading task */
  ariaDescription?: string;
}

const VARIANT_CLASS: Record<LoaderVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
};

const RHYTHM_OFFSETS: Record<Rhythm, number[]> = {
  steady: [30, 55, 80],
  pulse: [20, 50, 85],
  wave: [15, 45, 70, 90],
};

export const LoadingBar: React.FC<LoadingBarProps> = ({
  className,
  label,
  progress,
  showCompletionBadge = true,
  variant = 'primary',
  rhythm = 'steady',
  ariaDescription,
}) => {
  const [internalProgress, setInternalProgress] = useState(() =>
    progress !== undefined ? clampProgress(progress) : 12
  );
  const [isComplete, setIsComplete] = useState(() => internalProgress >= 100);

  const effectiveProgress = useMemo(() => {
    if (progress === undefined) return internalProgress;
    return clampProgress(progress);
  }, [progress, internalProgress]);

  useEffect(() => {
    if (progress !== undefined) {
      setIsComplete(progress >= 100);
      return;
    }

    const offsets = RHYTHM_OFFSETS[rhythm] ?? RHYTHM_OFFSETS.steady;
    let frame = 0;
    const interval = window.setInterval(() => {
      frame = (frame + 1) % offsets.length;
      const target = offsets[frame];
      setInternalProgress((prev) => {
        if (prev >= 98) {
          setIsComplete(true);
          return 100;
        }
        if (target <= prev) {
          return prev + Math.max(1, (100 - prev) * 0.08);
        }
        return target;
      });
    }, 420);

    return () => window.clearInterval(interval);
  }, [progress, rhythm]);

  useEffect(() => {
    if (progress === undefined) return;
    if (progress >= 100) {
      setIsComplete(true);
    } else if (isComplete) {
      setIsComplete(false);
    }
  }, [progress, isComplete]);

  return (
    <div
      className={cn('w-full space-y-2', className)}
      role="group"
      aria-label={label ?? 'Loading'}
      aria-description={ariaDescription}
    >
      {(label || showCompletionBadge) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          {showCompletionBadge && isComplete && (
            <span className="text-success font-medium">Complete</span>
          )}
        </div>
      )}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(effectiveProgress)}
      >
        <div
          className={cn(
            'h-full transition-all duration-400 ease-out will-change-transform',
            VARIANT_CLASS[variant]
          )}
          style={{ width: `${Math.min(100, Math.max(0, effectiveProgress))}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{isComplete ? 'Ready' : 'Loading'}</span>
        <span>{Math.round(effectiveProgress)}%</span>
      </div>
    </div>
  );
};

function clampProgress(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export default LoadingBar;
