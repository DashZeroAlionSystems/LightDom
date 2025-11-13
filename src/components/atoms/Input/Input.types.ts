import type { ReactNode } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;

  /** Error message to display */
  error?: string;

  /** Helper text displayed below the input */
  helperText?: string;

  /** Icon displayed on the left side */
  leftIcon?: ReactNode;

  /** Icon displayed on the right side */
  rightIcon?: ReactNode;

  /** Visual variant of the input */
  variant?: 'outlined' | 'filled';

  /** Size of the input */
  size?: 'sm' | 'md' | 'lg';

  /** Whether the input should take full width */
  fullWidth?: boolean;
}
