// LightDom Design System - UI Components Export
// Modern, accessible, and Material Design 3 component library

// Core Components
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  cardVariants 
} from './Card';
export type { 
  CardProps, 
  CardHeaderProps, 
  CardTitleProps, 
  CardDescriptionProps, 
  CardContentProps, 
  CardFooterProps 
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
  MuiThemeProvider
} from './design-system';

// Layout Components
export { DashboardShell, shellVariants } from './DashboardShell';
export type { DashboardShellProps, NavigationItem } from './DashboardShell';

export { KpiGrid, KpiCard } from './DashboardKpi';
export type { KpiGridProps, KpiCardProps } from './DashboardKpi';

export { AsyncStateEmpty, AsyncStateError, AsyncStateLoading } from './DashboardAsyncState';

// Existing components
export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter, modalVariants } from './Modal';
export { LoadingSpinner, PulseSpinner, DotsSpinner, Skeleton, LoadingOverlay, spinnerVariants } from './LoadingSpinner';
export { Tooltip, tooltipVariants } from './Tooltip';
export { ToastProvider, Toast, toastVariants, toast } from './Toast';
export { Progress, CircularProgress, StepProgress, progressVariants } from './Progress';
export { AnimatedCounter, AnimatedNumber, AnimatedProgress } from './AnimatedCounter';
export { GradientText, GradientBackground, GradientBorder } from './GradientText';

// Form Components
export { FormField, formFieldVariants } from './FormField';
export type { FormFieldProps } from './FormField';

export { Select, selectVariants } from './select';
export type { SelectProps, SelectOption } from './select';

export { Checkbox, checkboxVariants } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

// Feedback Components
export { Alert, AlertTitle, AlertDescription, alertVariants } from './alert';
export type { AlertProps, AlertTitleProps, AlertDescriptionProps } from './alert';

// Utility Components
export { Divider, dividerVariants } from './Divider';
export type { DividerProps } from './Divider';

export { Spacer, spacerVariants } from './Spacer';
export type { SpacerProps } from './Spacer';

// Workflow Components
export { WorkflowPanel, WorkflowPanelSection, WorkflowPanelFooter } from './WorkflowPanel';
export type { WorkflowPanelProps, WorkflowPanelSectionProps } from './WorkflowPanel';

export { Wizard, WizardContent, WizardFooter, useWizard } from './Wizard';
export type { WizardProps, WizardStepDescriptor, WizardStepStatus } from './Wizard';

// Re-export theme hook
export { useTheme, ThemeProvider, ThemeToggle } from '../../hooks/state/useTheme';

// Status & Progress Components
export { StatusIndicator } from './StatusIndicator';
export type { StatusIndicatorProps } from './StatusIndicator';

export { ProgressIndicator, CircularProgress as CircularProgressIndicator } from './ProgressIndicator';
export type { ProgressIndicatorProps, CircularProgressProps } from './ProgressIndicator';

// Enhanced Workflow Components
export { WorkflowList, WorkflowListItem } from './WorkflowList';
export type { WorkflowListProps, WorkflowListItemProps, WorkflowItemData } from './WorkflowList';

// Prompt & Input Components
export { PromptInput } from './PromptInput';
export type { PromptInputProps } from './PromptInput';

// Utility Components
export { NotImplemented, NotImplementedWrapper } from './NotImplemented';
export type { NotImplementedProps, NotImplementedWrapperProps } from './NotImplemented';

// Atomic Components - Live Data & Status Indicators
export {
  LiveStatusIndicator,
  LiveMetricCard,
  ActivityPulse
} from './atoms/LiveStatusIndicator';
export type {
  LiveStatusIndicatorProps,
  LiveMetricCardProps,
  ActivityPulseProps
} from './atoms/LiveStatusIndicator';

export {
  LiveCounter,
  LiveProgressBar,
  LiveBadge,
  LiveTimestamp
} from './atoms/LiveDataDisplay';
export type {
  LiveCounterProps,
  LiveProgressBarProps,
  LiveBadgeProps,
  LiveTimestampProps
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