/**
 * Utility for merging Tailwind CSS classes
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution
 *
 * @example
 * ```ts
 * cn('px-4 py-2', 'px-6') // => 'py-2 px-6' (px-4 is overridden)
 * cn('text-red-500', condition && 'text-blue-500') // => conditional classes
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
