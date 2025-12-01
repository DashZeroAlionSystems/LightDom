export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the badge */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';

  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';

  /** Show a dot indicator */
  dot?: boolean;
}
