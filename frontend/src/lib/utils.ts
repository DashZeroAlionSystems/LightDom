import clsx from 'clsx';

// Small utility wrapper used across the app for composing class names.
export function cn(...args: Array<any>) {
  return clsx(...args);
}

// Generate initials from a person's name. Handles excess whitespace and hyphenated names.
export function getInitials(name?: string, limit = 2): string {
  if (!name) {
    return '';
  }

  const segments = name
    .trim()
    .replace(/[-_]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (segments.length === 0) {
    return '';
  }

  const initials = segments
    .map((segment) => segment.charAt(0).toUpperCase())
    .join('');

  return initials.slice(0, Math.max(1, limit));
}

// Additional light helpers can be added here as needed.
export const noop = () => {};
