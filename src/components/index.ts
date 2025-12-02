/**
 * Components Index File
 * Main exports for all components including the MainDashboard
 */

// Main Dashboard (Admin/User Switchable)
export { default as MainDashboard } from './MainDashboard';

// Admin Components
export { default as EnhancedAdminDashboard } from './admin/EnhancedAdminDashboard';
export { default as AdminDashboard } from './admin/AdminDashboard';

// Settings Components
export { default as SettingsDashboard } from './settings/SettingsDashboard';
export { default as GeneralSettings } from './settings/GeneralSettings';
export { default as SecuritySettings } from './settings/SecuritySettings';
export { default as SystemSettings } from './settings/SystemSettings';

// Page Components
export { default as NeuralNetworkPage } from './pages/NeuralNetworkPage';
export { default as SEOContentGeneratorPage } from './pages/SEOContentGeneratorPage';
export { default as UserManagementPage } from './pages/UserManagementPage';
export { default as BillingManagementPage } from './pages/BillingManagementPage';

// Specialized Components
export { default as NeuralNetworkComponents } from './specialized/NeuralNetworkComponents';
export { default as SEOComponents } from './specialized/SEOComponents';

// Design System Components
export { default as DesignSystemComponents } from './DesignSystemComponents';

// AI/Finetuning Components
export { default as FinetuningDashboard } from './FinetuningDashboard';

// Workflow Orchestration Components
export { default as WorkflowOrchestrationDashboard } from './WorkflowOrchestrationDashboard';

// Dashboard Components
export { default as AdvancedDashboardIntegrated } from './AdvancedDashboardIntegrated';
export { default as StyleguideIntegratedDashboard } from './StyleguideIntegratedDashboard';

// Navigation
export { default as MainNavigation, mainNavigationItems } from './navigation/MainNavigation';
