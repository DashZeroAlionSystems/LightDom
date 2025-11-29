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

// Re-exports from main src (for backward compatibility)
export {
  WorkflowPanel,
  WorkflowPanelFooter,
  WorkflowPanelSection,
} from '../../../../src/components/ui/WorkflowPanel';

export {
  KpiCard, KpiGrid
} from './DashboardKpi';

export {
  AsyncStateEmpty,
  AsyncStateError,
  AsyncStateLoading,
} from '../../../../src/components/ui/DashboardAsyncState';

export { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../src/components/ui/tabs';

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
} from '../../../../src/components/ui/Wizard';

export { default as Fab } from '../../../../src/components/ui/design-system/Fab';

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
} from '../../../../src/components/ui/NeuralNetwork';

// Codebase Search - Semantic codebase search with AI context
export { CodebaseSearch } from './CodebaseSearch';
