/**
 * Frontend Design System
 * 
 * Centralized exports for the design system that powers
 * all frontend components, pages, dashboards, and navigation.
 * 
 * This module re-exports from the DesignSystemProvider and provides
 * type-safe access to design tokens and styleguide rules.
 */

export {
  DesignSystemProvider,
  useDesignSystem,
  useStyleguideCheck,
  designTokens,
  styleguideRules,
} from './DesignSystemProvider';

export type {
  // Re-export useful types if needed
} from './DesignSystemProvider';

// Helper function to get CSS variable value
export function getCSSVariable(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Helper to apply design tokens to inline styles
export function tokenToStyle(token: string | number): string {
  if (typeof token === 'number') return `${token}px`;
  return token;
}

// Spacing utilities following 8px grid
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
} as const;

// Common transition presets
export const transitions = {
  fast: 'all 150ms ease-out',
  normal: 'all 250ms ease-in-out',
  slow: 'all 350ms ease-in-out',
  spring: 'all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Color mode detection
export function getPreferredColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Motion preference detection
export function getPreferredMotion(): 'full' | 'reduced' {
  if (typeof window === 'undefined') return 'full';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
}
