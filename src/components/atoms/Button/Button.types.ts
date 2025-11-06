/**
 * Button Component Types
 * Generated from atomic schema
 */

export interface ButtonProps {
  /** Button label text */
  label: string;
  /** Button variant: primary, secondary, danger, success */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  /** Button size: small, medium, large */
  size?: 'small' | 'medium' | 'large';
  /** Disabled state */
  disabled?: boolean;
  /** Click event handler */
  onClick?: () => void;
}

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
export type ButtonSize = 'small' | 'medium' | 'large';
