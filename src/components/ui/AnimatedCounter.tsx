import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/validation/cn';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  onComplete?: () => void;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  onComplete,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (displayValue === value) return;

    setIsAnimating(true);
    startTimeRef.current = performance.now();
    startValueRef.current = displayValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValueRef.current + (value - startValueRef.current) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, onComplete]);

  const formatValue = (num: number) => {
    return num.toFixed(decimals);
  };

  return (
    <span className={cn('inline-block', className)}>
      {prefix}
      <span className={isAnimating ? 'transition-all duration-100' : ''}>
        {formatValue(displayValue)}
      </span>
      {suffix}
    </span>
  );
};

// Number formatter with animations
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: 'number' | 'currency' | 'percentage' | 'compact';
  currency?: string;
  locale?: string;
  className?: string;
  onComplete?: () => void;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1000,
  format = 'number',
  currency = 'USD',
  locale = 'en-US',
  className,
  onComplete,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (displayValue === value) return;

    setIsAnimating(true);
    startTimeRef.current = performance.now();
    startValueRef.current = displayValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValueRef.current + (value - startValueRef.current) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, onComplete]);

  const formatNumber = (num: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        }).format(num);
      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        }).format(num / 100);
      case 'compact':
        return new Intl.NumberFormat(locale, {
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(num);
      default:
        return new Intl.NumberFormat(locale).format(num);
    }
  };

  return (
    <span className={cn('inline-block', className)}>
      <span className={isAnimating ? 'transition-all duration-100' : ''}>
        {formatNumber(displayValue)}
      </span>
    </span>
  );
};

// Animated progress bar with counter
interface AnimatedProgressProps {
  value: number;
  max?: number;
  duration?: number;
  showCounter?: boolean;
  counterFormat?: 'number' | 'percentage';
  className?: string;
  barClassName?: string;
  counterClassName?: string;
}

const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  duration = 1000,
  showCounter = true,
  counterFormat = 'percentage',
  className,
  barClassName,
  counterClassName,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (animatedValue === value) return;

    setIsAnimating(true);
    startTimeRef.current = performance.now();
    startValueRef.current = animatedValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValueRef.current + (value - startValueRef.current) * easeOut;
      setAnimatedValue(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedValue(value);
        setIsAnimating(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  const percentage = (animatedValue / max) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {showCounter && (
        <div className="flex justify-between items-center">
          <AnimatedCounter
            value={counterFormat === 'percentage' ? percentage : animatedValue}
            duration={duration}
            decimals={counterFormat === 'percentage' ? 1 : 0}
            suffix={counterFormat === 'percentage' ? '%' : ''}
            className={counterClassName}
          />
        </div>
      )}
      <div className="w-full bg-surface rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-primary transition-all duration-300 ease-out',
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export { AnimatedCounter, AnimatedNumber, AnimatedProgress };