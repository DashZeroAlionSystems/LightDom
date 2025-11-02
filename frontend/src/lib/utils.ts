import clsx from 'clsx';

// Small utility wrapper used across the app for composing class names.
export function cn(...args: Array<any>) {
  return clsx(...args);
}

// Additional light helpers can be added here as needed.
export const noop = () => {};
