// LightDom Design System - UI Components Export
// Modern, accessible, and Material Design 3 component library

// Core Components
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
} from './Card';
export type {
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
} from './Card';

export { Badge, badgeVariants } from './Badge';
export type { BadgeProps } from './Badge';

export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

// Material Design 3 Components
export {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Chip,
  Drawer,
  Fab,
  List,
  ListItem,
  MuiThemeProvider,
} from './design-system';

// Layout Components
export { DashboardShell, shellVariants } from './DashboardShell';
export type { DashboardShellProps, NavigationItem } from './DashboardShell';

export { KpiCard, KpiGrid } from './DashboardKpi';
export type { KpiCardProps, KpiGridProps } from './DashboardKpi';

export { AsyncStateEmpty, AsyncStateError, AsyncStateLoading } from './DashboardAsyncState';

// Existing components
export { AnimatedCounter, AnimatedNumber, AnimatedProgress } from './AnimatedCounter';
export { GradientBackground, GradientBorder, GradientText } from './GradientText';
export {
  DotsSpinner,
  LoadingOverlay,
  LoadingSpinner,
  PulseSpinner,
  Skeleton,
  spinnerVariants,
} from './LoadingSpinner';
export {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  modalVariants,
} from './Modal';
export { CircularProgress, Progress, StepProgress, progressVariants } from './Progress';
export { Toast, ToastProvider, toast, toastVariants } from './Toast';
export { Tooltip, tooltipVariants } from './Tooltip';

// Form Components
export { FormField, formFieldVariants } from './FormField';
export type { FormFieldProps } from './FormField';

export { Select, selectVariants } from './select';
export type { SelectOption, SelectProps } from './select';

export { Checkbox, checkboxVariants } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

// Feedback Components
export { Alert, AlertDescription, AlertTitle, alertVariants } from './alert';
export type { AlertDescriptionProps, AlertProps, AlertTitleProps } from './alert';

// Utility Components
export { Divider, dividerVariants } from './Divider';
export type { DividerProps } from './Divider';

export { Spacer, spacerVariants } from './Spacer';
export type { SpacerProps } from './Spacer';

// Workflow Components
export { WorkflowPanel, WorkflowPanelFooter, WorkflowPanelSection } from './WorkflowPanel';
export type { WorkflowPanelProps, WorkflowPanelSectionProps } from './WorkflowPanel';

export { Wizard, WizardContent, WizardFooter, useWizard } from './Wizard';
export type { WizardProps, WizardStepDescriptor, WizardStepStatus } from './Wizard';

// Re-export theme hook
export { ThemeProvider, ThemeToggle, useTheme } from '../../hooks/state/useTheme';

// Status & Progress Components
export { StatusIndicator } from './StatusIndicator';
export type { StatusIndicatorProps } from './StatusIndicator';

export {
  CircularProgress as CircularProgressIndicator,
  ProgressIndicator,
} from './ProgressIndicator';
export type { CircularProgressProps, ProgressIndicatorProps } from './ProgressIndicator';

// Enhanced Workflow Components
export { WorkflowList, WorkflowListItem } from './WorkflowList';
export type { WorkflowItemData, WorkflowListItemProps, WorkflowListProps } from './WorkflowList';

// Prompt & Input Components
export { PromptInput } from './PromptInput';
export type { PromptInputProps } from './PromptInput';

// Utility Components
export { NotImplemented, NotImplementedWrapper } from './NotImplemented';
export type { NotImplementedProps, NotImplementedWrapperProps } from './NotImplemented';

// Atomic Components - Live Data & Status Indicators
export { ActivityPulse, LiveMetricCard, LiveStatusIndicator } from './atoms/LiveStatusIndicator';
export type {
  ActivityPulseProps,
  LiveMetricCardProps,
  LiveStatusIndicatorProps,
} from './atoms/LiveStatusIndicator';

export { LiveBadge, LiveCounter, LiveProgressBar, LiveTimestamp } from './atoms/LiveDataDisplay';
export type {
  LiveBadgeProps,
  LiveCounterProps,
  LiveProgressBarProps,
  LiveTimestampProps,
} from './atoms/LiveDataDisplay';

// Re-export newly created atoms for convenience
export { TextArea } from './atoms/TextArea';
export type { TextAreaProps } from './atoms/TextArea';

export { SeedItem } from './atoms/SeedItem';
export type { SeedItemProps } from './atoms/SeedItem';

// New atoms
export { TagInput } from './atoms/TagInput';
export type { TagInputProps } from './atoms/TagInput';

export { ToggleSwitch } from './atoms/ToggleSwitch';
export type { ToggleSwitchProps } from './atoms/ToggleSwitch';

export { ConfigPanel } from './atoms/ConfigPanel';
export type { ConfigPanelProps, CrawlerConfig } from './atoms/ConfigPanel';
