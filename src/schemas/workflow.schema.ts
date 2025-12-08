// Workflow Schema - Based on AI Research 2025
// Implements agentic workflow patterns from SCHEMA_AI_RESEARCH_2025.md

import { z } from 'zod';

export const WorkflowStepSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['manual', 'automated', 'ai']),
  schema: z.record(z.unknown()),
  validation: z.array(z.object({
    rule: z.string(),
    params: z.record(z.unknown()).optional(),
  })),
  aiAssistance: z.object({
    model: z.string(),
    promptTemplate: z.string(),
    confidenceThreshold: z.number().min(0).max(1),
  }).optional(),
  nextSteps: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkflowTransitionSchema = z.object({
  id: z.string().uuid(),
  from: z.string(),
  to: z.string(),
  condition: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  steps: z.array(WorkflowStepSchema),
  transitions: z.array(WorkflowTransitionSchema),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWorkflowSchema = WorkflowSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateWorkflowSchema = CreateWorkflowSchema.partial();

export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type WorkflowTransition = z.infer<typeof WorkflowTransitionSchema>;
export type CreateWorkflow = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflow = z.infer<typeof UpdateWorkflowSchema>;
