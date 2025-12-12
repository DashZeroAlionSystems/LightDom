/**
 * Accessibility Utilities
 * 
 * Helper functions and utilities for building accessible components
 * following WCAG 2.1 AA standards.
 */

// =============================================================================
// ARIA Helpers
// =============================================================================

/**
 * Generate ARIA describedby ID
 */
export function getAriaDescribedby(...ids: (string | undefined)[]): string | undefined {
  const validIds = ids.filter(Boolean);
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Generate ARIA labelledby ID
 */
export function getAriaLabelledby(...ids: (string | undefined)[]): string | undefined {
  const validIds = ids.filter(Boolean);
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Get ARIA live region settings based on priority
 */
export function getLiveRegionProps(priority: 'assertive' | 'polite' | 'off' = 'polite') {
  return {
    'aria-live': priority,
    'aria-atomic': 'true',
  };
}

// =============================================================================
// Keyboard Navigation
// =============================================================================

export type KeyboardKey = 
  | 'Enter'
  | 'Space'
  | 'Escape'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Tab'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown';

/**
 * Check if a keyboard event matches a specific key
 */
export function isKey(event: React.KeyboardEvent, key: KeyboardKey): boolean {
  // Handle Space key specially (can be ' ' or 'Space')
  if (key === 'Space') {
    return event.key === ' ' || event.key === 'Space';
  }
  return event.key === key;
}

/**
 * Handle keyboard event for button-like elements
 */
export function handleButtonKeyDown(
  event: React.KeyboardEvent,
  callback: () => void
): void {
  if (isKey(event, 'Enter') || isKey(event, 'Space')) {
    event.preventDefault();
    callback();
  }
}

/**
 * Get next focusable element in a list
 */
export function getNextFocusable(
  currentElement: HTMLElement,
  direction: 'next' | 'prev' | 'first' | 'last',
  selector: string = '[tabindex]:not([tabindex="-1"]), button:not(:disabled), a[href]'
): HTMLElement | null {
  const parent = currentElement.closest('[role="group"], [role="menu"], [role="listbox"]');
  if (!parent) return null;

  const focusableElements = Array.from(parent.querySelectorAll<HTMLElement>(selector));
  const currentIndex = focusableElements.indexOf(currentElement);

  switch (direction) {
    case 'next':
      return focusableElements[currentIndex + 1] || focusableElements[0];
    case 'prev':
      return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1];
    case 'first':
      return focusableElements[0];
    case 'last':
      return focusableElements[focusableElements.length - 1];
    default:
      return null;
  }
}

// =============================================================================
// Focus Management
// =============================================================================

/**
 * Trap focus within a container (useful for modals, dialogs)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Store and restore focus (useful for modals)
 */
export function createFocusManager() {
  let previouslyFocusedElement: HTMLElement | null = null;

  return {
    store: () => {
      previouslyFocusedElement = document.activeElement as HTMLElement;
    },
    restore: () => {
      if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus();
        previouslyFocusedElement = null;
      }
    },
  };
}

// =============================================================================
// Color Contrast
// =============================================================================

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio between 1:1 and 21:1
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) return 1;

  const fgLuminance = getLuminance(...fgRgb);
  const bgLuminance = getLuminance(...bgRgb);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param ratio - Contrast ratio
 * @param level - 'AA' or 'AAA'
 * @param textSize - 'normal' or 'large' (large is 18pt+ or 14pt+ bold)
 */
export function meetsContrastRequirement(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  textSize: 'normal' | 'large' = 'normal'
): boolean {
  if (level === 'AAA') {
    return textSize === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  return textSize === 'large' ? ratio >= 3 : ratio >= 4.5;
}

// =============================================================================
// Screen Reader Utilities
// =============================================================================

/**
 * Visually hidden but accessible to screen readers
 */
export const visuallyHiddenStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: 0,
};

/**
 * Get screen reader only text class
 */
export const srOnlyClass = 'sr-only';

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'assertive' | 'polite' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.cssText = Object.entries(visuallyHiddenStyles)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${value}`)
    .join(';');
  
  announcement.textContent = message;
  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// =============================================================================
// Reduced Motion
// =============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration respecting user preference
 */
export function getAccessibleDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration;
}

// =============================================================================
// Form Validation
// =============================================================================

/**
 * Get ARIA validation attributes for form fields
 */
export function getValidationProps(
  isInvalid?: boolean,
  errorId?: string,
  descriptionId?: string
) {
  return {
    'aria-invalid': isInvalid || undefined,
    'aria-describedby': getAriaDescribedby(
      isInvalid ? errorId : undefined,
      descriptionId
    ),
  };
}

/**
 * Get required field props
 */
export function getRequiredProps(required?: boolean) {
  return {
    required: required || undefined,
    'aria-required': required || undefined,
  };
}
