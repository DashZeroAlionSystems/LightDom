/**
 * Design System Components
 * 
 * Comprehensive design system for creating reusable components, dashboards,
 * and workflows using AI-powered schema generation.
 */

export { default as SchemaEditor } from './SchemaEditor';
export type { SchemaEditorProps, ComponentSchema, SchemaField, FieldType, ValidationRule } from './SchemaEditor';

export { default as PromptToComponent } from './PromptToComponent';
export type { PromptToComponentProps } from './PromptToComponent';

export { default as WorkflowWizard } from './WorkflowWizard';
export type { WorkflowWizardProps, WorkflowCampaign, WorkflowTemplate, WorkflowTask } from './WorkflowWizard';

export { default as EnhancedWorkflowWizard } from './EnhancedWorkflowWizard';
export type { EnhancedWorkflowWizardProps, EnhancedWorkflowCampaign, WorkflowProcess } from './EnhancedWorkflowWizard';

export { default as WorkflowManagementDashboard } from './WorkflowManagementDashboard';

export { default as DashboardGenerator } from './DashboardGenerator';
export type { DashboardGeneratorProps } from './DashboardGenerator';

export { default as MotionAnimationGenerator } from './MotionAnimationGenerator';
export type { MotionAnimationGeneratorProps } from './MotionAnimationGenerator';
