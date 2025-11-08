/**
 * Atoms Index - Central export for all atomic components
 * These are the foundational building blocks of the design system
 */

// Button atoms
export { Button, IconButton } from './Button';
export type { ButtonProps, IconButtonProps } from './Button';

// Card atoms
export { Card, CardHeader, CardSection } from './Card';
export type { CardProps, CardHeaderProps, CardSectionProps } from './Card';

// Badge atoms
export { Badge, StatusBadge, NotificationBadge } from './Badge';
export type { BadgeProps, StatusBadgeProps, NotificationBadgeProps } from './Badge';

// Typography atoms
export { Heading, Text, Label, Caption, Code } from './Typography';
export type { HeadingProps, TextProps, LabelProps, CaptionProps, CodeProps } from './Typography';

// Icon atoms
export { IconWrapper, StatusIcon, CircularIcon, NavigationIcon } from './Icon';
export type { IconWrapperProps, StatusIconProps, CircularIconProps, NavigationIconProps } from './Icon';

// Live data atoms (existing)
export {
  LiveCounter,
  LiveProgressBar,
  LiveBadge,
  LiveTimestamp,
} from './LiveDataDisplay';
export type {
  LiveCounterProps,
  LiveProgressBarProps,
  LiveBadgeProps,
  LiveTimestampProps,
} from './LiveDataDisplay';

// Live status atoms (existing)
export {
  LiveStatusIndicator,
  LiveMetricCard,
  ActivityPulse,
} from './LiveStatusIndicator';
export type {
  LiveStatusIndicatorProps,
  LiveMetricCardProps,
  ActivityPulseProps,
} from './LiveStatusIndicator';

// Additional atoms created for admin components
export { TextArea } from './TextArea';
export type { TextAreaProps } from './TextArea';

export { SeedItem } from './SeedItem';
export type { SeedItemProps } from './SeedItem';

// New atoms
export { TagInput } from './TagInput';
export type { TagInputProps } from './TagInput';

export { ToggleSwitch } from './ToggleSwitch';
export type { ToggleSwitchProps } from './ToggleSwitch';

export { ConfigPanel } from './ConfigPanel';
export type { ConfigPanelProps, CrawlerConfig } from './ConfigPanel';
