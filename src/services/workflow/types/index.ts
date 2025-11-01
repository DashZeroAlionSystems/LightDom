/**
 * Workflow Service Type Definitions
 * Re-export types from WorkflowRepository for better organization
 */

export type {
  WorkflowRecord,
  WorkflowAttributeRecord,
  WorkflowSeedRecord,
  WorkflowRunRecord,
  TrainingArtifactRecord,
  WorkflowTemplateRecord,
  WorkflowTemplateTaskRecord,
  WorkflowInstanceRecord,
  ComponentSchemaLinkRecord,
  TfBaseModelRecord,
  TfModelInstanceRecord,
  WorkflowAdminTask,
  WorkflowAdminAttribute,
  WorkflowAdminSummary,
  NeuralNetworkInstanceRecord,
  NeuralTrainingRunRecord,
  NeuralTrainingSchemaVersionRecord,
  NeuralSchemaLinkRecord,
  NeuralAttributeSuggestionRecord,
} from '../WorkflowRepository';

export type {
  AtomBlueprint,
  ComponentBlueprint,
  DashboardBlueprint,
  WorkflowBlueprint,
} from '../PromptWorkflowBuilder';
