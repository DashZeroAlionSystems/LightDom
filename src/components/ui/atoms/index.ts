/**
 * Atoms Index - Central export for all atomic components
 * These are the foundational building blocks of the design system
 */

// Button atoms
export { Button, IconButton } from './Button';
export type { ButtonProps, IconButtonProps } from './Button';

// Card atoms
export { Card, CardHeader, CardSection } from './Card';
export type { CardHeaderProps, CardProps, CardSectionProps } from './Card';

// Badge atoms
export { Badge, NotificationBadge, StatusBadge } from './Badge';
export type { BadgeProps, NotificationBadgeProps, StatusBadgeProps } from './Badge';

// Typography atoms
export { Caption, Code, Heading, Label, Text } from './Typography';
export type { CaptionProps, CodeProps, HeadingProps, LabelProps, TextProps } from './Typography';

// Icon atoms
export { CircularIcon, IconWrapper, NavigationIcon, StatusIcon } from './Icon';
export type {
  CircularIconProps,
  IconWrapperProps,
  NavigationIconProps,
  StatusIconProps,
} from './Icon';

// Live data atoms (existing)
export { LiveBadge, LiveCounter, LiveProgressBar, LiveTimestamp } from './LiveDataDisplay';
export type {
  LiveBadgeProps,
  LiveCounterProps,
  LiveProgressBarProps,
  LiveTimestampProps,
} from './LiveDataDisplay';

// Live status atoms (existing)
export { ActivityPulse, LiveMetricCard, LiveStatusIndicator } from './LiveStatusIndicator';
export type {
  ActivityPulseProps,
  LiveMetricCardProps,
  LiveStatusIndicatorProps,
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
