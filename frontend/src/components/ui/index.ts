// Atomic Design System Components (local)
export { DeepSeekCategoryCrud } from './admin/DeepSeekCategoryCrud';
export { Avatar } from './Avatar';
export { Badge } from './Badge';
export { Button } from './Button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
export { Checkbox } from './Checkbox';
export { Divider } from './Divider';
export { Input } from './Input';
export { TextArea } from './TextArea';
export { Modal } from './Modal';
export { Progress } from './Progress';
export { ServiceActionButton } from './ServiceActionButton';
export { ServiceActionBar } from './ServiceActionBar';
export {
  WorkspaceLayout,
  WorkspaceRailSection,
  WorkspaceSection,
  WorkspaceTabs,
  WorkspaceToggleGroup,
} from './WorkspaceLayout';

// Local copies of essential components (no longer needs src/ references)
export {
  WorkflowPanel,
  WorkflowPanelFooter,
  WorkflowPanelSection,
} from './WorkflowPanel';

export {
  KpiCard, KpiGrid
} from './DashboardKpi';

export {
  AsyncStateEmpty,
  AsyncStateError,
  AsyncStateLoading,
} from './DashboardAsyncState';

export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

export { LoadingBar } from './LoadingBar';

export {
  PromptCompose,
  PromptComposeAction,
  PromptComposeFooter,
  PromptComposeHeader,
  PromptComposeInput,
  PromptComposeShell,
  PromptComposeToken,
  PromptComposeToolbar,
} from './PromptCompose';

export { PromptInput } from './PromptInput';

export {
  PromptSidebar,
  PromptSidebarDivider,
  PromptSidebarItem,
  PromptSidebarSection,
  PromptSidebarShell,
} from './PromptSidebar';

export {
  Wizard,
  WizardContent,
  WizardFooter,
  useWizard,
} from './Wizard';

export { default as Fab } from './design-system/Fab';

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './Accordion';

export {
  MetricsChart,
  ModelCard,
  NeuralNetworkVisualizer,
} from './NeuralNetwork';

// Codebase Search - Semantic codebase search with AI context
export { CodebaseSearch } from './CodebaseSearch';

// Tooltip component
export { Tooltip } from './Tooltip';

// Additional UI components
export { Toast, ToastProvider, toastVariants, useToast } from './Toast';
export { Switch } from './Switch';
export { Skeleton } from './Skeleton';
export { Slider } from './Slider';
export { Select, selectVariants } from './select';
export type { SelectProps, SelectOption } from './select';
export { Alert, AlertDescription, AlertTitle } from './alert';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from './dialog';
export { Label } from './label';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

// Design System Components (Material Design 3 inspired)
export * from './design-system';
