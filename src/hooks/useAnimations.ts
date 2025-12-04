/**
 * Animation Hooks for React
 * 
 * Custom React hooks for integrating anime.js animations into React components.
 * These hooks handle lifecycle management and provide clean APIs for common animations.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import type { JSAnimation, Timeline } from 'animejs';
import {
  buttonPressAnimation,
  buttonHoverEnterAnimation,
  buttonHoverLeaveAnimation,
  inputFocusAnimation,
  inputBlurAnimation,
  inputErrorShakeAnimation,
  modelCardHoverAnimation,
  modelCardHoverLeaveAnimation,
  modelCardSelectAnimation,
  formFieldsEntranceAnimation,
  toastEnterAnimation,
  toastExitAnimation,
} from '../utils/formControlAnimations';

// =============================================================================
// Types
// =============================================================================

export interface UseAnimatedButtonOptions {
  enableHover?: boolean;
  enablePress?: boolean;
  enableRipple?: boolean;
  duration?: number;
}

export interface UseAnimatedInputOptions {
  animateFocus?: boolean;
  animateError?: boolean;
  duration?: number;
}

export interface UseAnimatedListOptions {
  stagger?: number;
  duration?: number;
  animateOnMount?: boolean;
}

type AnimationInstance = JSAnimation | Timeline | null;

// =============================================================================
// useAnimatedButton Hook
// =============================================================================

/**
 * Hook for animated button interactions
 * 
 * @example
 * ```tsx
 * const { ref, handlers } = useAnimatedButton();
 * return <button ref={ref} {...handlers}>Click me</button>
 * ```
 */
export function useAnimatedButton(options: UseAnimatedButtonOptions = {}) {
  const {
    enableHover = true,
    enablePress = true,
    duration = 200,
  } = options;
  
  const ref = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<AnimationInstance>(null);
  
  const handleMouseEnter = useCallback(() => {
    if (!enableHover || !ref.current) return;
    
    animationRef.current?.pause();
    animationRef.current = buttonHoverEnterAnimation(ref.current, { duration });
  }, [enableHover, duration]);
  
  const handleMouseLeave = useCallback(() => {
    if (!enableHover || !ref.current) return;
    
    animationRef.current?.pause();
    animationRef.current = buttonHoverLeaveAnimation(ref.current, { duration });
  }, [enableHover, duration]);
  
  const handleMouseDown = useCallback(() => {
    if (!enablePress || !ref.current) return;
    
    buttonPressAnimation(ref.current, { duration: duration * 0.75 });
  }, [enablePress, duration]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRef.current?.pause();
    };
  }, []);
  
  return {
    ref,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
    },
  };
}

// =============================================================================
// useAnimatedInput Hook
// =============================================================================

/**
 * Hook for animated input field interactions
 * 
 * @example
 * ```tsx
 * const { ref, handlers, triggerError } = useAnimatedInput();
 * return <input ref={ref} {...handlers} />
 * ```
 */
export function useAnimatedInput(options: UseAnimatedInputOptions = {}) {
  const {
    animateFocus = true,
    animateError = true,
    duration = 200,
  } = options;
  
  const ref = useRef<HTMLInputElement>(null);
  const animationRef = useRef<AnimationInstance>(null);
  
  const handleFocus = useCallback(() => {
    if (!animateFocus || !ref.current) return;
    
    animationRef.current?.pause();
    animationRef.current = inputFocusAnimation(ref.current, { duration });
  }, [animateFocus, duration]);
  
  const handleBlur = useCallback(() => {
    if (!animateFocus || !ref.current) return;
    
    animationRef.current?.pause();
    animationRef.current = inputBlurAnimation(ref.current, { duration });
  }, [animateFocus, duration]);
  
  const triggerError = useCallback(() => {
    if (!animateError || !ref.current) return;
    
    animationRef.current?.pause();
    animationRef.current = inputErrorShakeAnimation(ref.current, { duration: 500 });
  }, [animateError]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRef.current?.pause();
    };
  }, []);
  
  return {
    ref,
    handlers: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    triggerError,
  };
}

// =============================================================================
// useAnimatedCard Hook
// =============================================================================

/**
 * Hook for animated card interactions (especially model cards)
 * 
 * @example
 * ```tsx
 * const { ref, handlers, triggerSelect } = useAnimatedCard();
 * return <div ref={ref} {...handlers}>Card content</div>
 * ```
 */
export function useAnimatedCard(options: { duration?: number } = {}) {
  const { duration = 200 } = options;
  
  const ref = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationInstance>(null);
  
  const handleMouseEnter = useCallback(() => {
    if (!ref.current) return;
    
    animationRef.current?.pause();
    animationRef.current = modelCardHoverAnimation(ref.current, { duration });
  }, [duration]);
  
  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    
    animationRef.current?.pause();
    animationRef.current = modelCardHoverLeaveAnimation(ref.current, { duration });
  }, [duration]);
  
  const triggerSelect = useCallback(() => {
    if (!ref.current) return;
    
    animationRef.current?.pause();
    animationRef.current = modelCardSelectAnimation(ref.current, { duration: 300 });
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRef.current?.pause();
    };
  }, []);
  
  return {
    ref,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    triggerSelect,
  };
}

// =============================================================================
// useAnimatedList Hook
// =============================================================================

/**
 * Hook for animating list items with staggered entrance
 * 
 * @example
 * ```tsx
 * const { containerRef, triggerEntrance } = useAnimatedList();
 * 
 * useEffect(() => {
 *   triggerEntrance();
 * }, [items]);
 * 
 * return (
 *   <div ref={containerRef}>
 *     {items.map(item => <div className="list-item">{item}</div>)}
 *   </div>
 * );
 * ```
 */
export function useAnimatedList(options: UseAnimatedListOptions = {}) {
  const {
    stagger = 80,
    duration = 400,
    animateOnMount = true,
  } = options;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationInstance>(null);
  
  const triggerEntrance = useCallback((selector = '.list-item') => {
    if (!containerRef.current) return;
    
    const items = containerRef.current.querySelectorAll(selector);
    if (items.length === 0) return;
    
    animationRef.current?.pause();
    animationRef.current = formFieldsEntranceAnimation(items, {
      stagger,
      duration,
    });
  }, [stagger, duration]);
  
  // Animate on mount if enabled
  useEffect(() => {
    if (animateOnMount) {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        triggerEntrance();
      }, 50);
      
      return () => clearTimeout(timeout);
    }
  }, [animateOnMount, triggerEntrance]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRef.current?.pause();
    };
  }, []);
  
  return {
    containerRef,
    triggerEntrance,
  };
}

// =============================================================================
// useAnimatedMount Hook
// =============================================================================

/**
 * Hook for animating component mount/unmount transitions
 * 
 * @example
 * ```tsx
 * const { ref, show, hide } = useAnimatedMount();
 * 
 * return (
 *   <div ref={ref}>Animated content</div>
 * );
 * ```
 */
export function useAnimatedMount(options: { duration?: number } = {}) {
  const { duration = 300 } = options;
  
  const ref = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  
  const show = useCallback(() => {
    if (!ref.current || isAnimatingRef.current) return Promise.resolve();
    
    isAnimatingRef.current = true;
    
    return new Promise<void>((resolve) => {
      toastEnterAnimation(ref.current!, { 
        duration,
      });
      // Use timeout as fallback since anime.js v4 doesn't expose promises consistently
      setTimeout(() => {
        isAnimatingRef.current = false;
        resolve();
      }, duration);
    });
  }, [duration]);
  
  const hide = useCallback(() => {
    if (!ref.current || isAnimatingRef.current) return Promise.resolve();
    
    isAnimatingRef.current = true;
    
    return new Promise<void>((resolve) => {
      toastExitAnimation(ref.current!, { 
        duration,
      });
      // Use timeout as fallback since anime.js v4 doesn't expose promises consistently
      setTimeout(() => {
        isAnimatingRef.current = false;
        resolve();
      }, duration);
    });
  }, [duration]);
  
  return {
    ref,
    show,
    hide,
  };
}

// =============================================================================
// useReducedMotion Hook
// =============================================================================

/**
 * Hook to detect user's reduced motion preference
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * 
 * if (!prefersReducedMotion) {
 *   // Run animations
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  
  return prefersReducedMotion;
}

// =============================================================================
// Export All Hooks
// =============================================================================

export default {
  useAnimatedButton,
  useAnimatedInput,
  useAnimatedCard,
  useAnimatedList,
  useAnimatedMount,
  useReducedMotion,
};
