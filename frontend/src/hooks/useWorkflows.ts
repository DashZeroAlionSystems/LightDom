import { useCallback, useEffect, useState } from 'react';

const BASE_URL = '/api/workflow-admin';

export interface WorkflowSummary {
  id: string;
  schemaKey: string;
  prompt: string;
  datasetName: string;
  datasetDescription?: string;
  categories: string[];
  createdAt: string;
}

export interface WorkflowAttribute {
  key: string;
  label: string;
  category?: string | null;
  description?: string | null;
  weight?: number | null;
  enrichmentPrompt?: string | null;
}

export interface WorkflowSeed {
  url: string;
  intent?: string | null;
  cadence?: string | null;
  schemaAttributes: string[];
  weight: number;
}

export interface WorkflowDetails extends WorkflowSummary {
  attributes: WorkflowAttribute[];
  seeds: WorkflowSeed[];
  hyperparameters?: Record<string, any>;
}

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/workflows`);
      if (!response.ok) {
        throw new Error(`Failed to fetch workflows: ${response.status}`);
      }
      const data = await response.json();
      const summaries: WorkflowSummary[] = (data.workflows ?? []).map((row: any) => ({
        id: row.id,
        schemaKey: row.schema_key,
        prompt: row.prompt,
        datasetName: row.dataset_name,
        datasetDescription: row.dataset_description ?? undefined,
        categories: Array.isArray(row.categories) ? row.categories : [],
        createdAt: row.created_at,
      }));
      setWorkflows(summaries);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWorkflowDetails = useCallback(async (workflowId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/workflows/${workflowId}`);
      if (!response.ok) {
        throw new Error(`Failed to load workflow ${workflowId}`);
      }
      const data = await response.json();
      const workflowRow = data.workflow;
      if (!workflowRow) {
        setSelectedWorkflow(null);
      } else {
        const details: WorkflowDetails = {
          id: workflowRow.id,
          schemaKey: workflowRow.schema_key,
          prompt: workflowRow.prompt,
          datasetName: workflowRow.dataset_name,
          datasetDescription: workflowRow.dataset_description ?? undefined,
          categories: Array.isArray(workflowRow.categories) ? workflowRow.categories : [],
          createdAt: workflowRow.created_at,
          attributes: (workflowRow.attributes ?? []).map((attr: any) => ({
            key: attr.attr_key,
            label: attr.label,
            category: attr.category ?? null,
            description: attr.description ?? null,
            weight: attr.weight ?? null,
            enrichmentPrompt: attr.enrichment_prompt ?? '',
          })),
          seeds: (workflowRow.seeds ?? []).map((seed: any) => ({
            url: seed.url,
            intent: seed.intent ?? null,
            cadence: seed.cadence ?? null,
            schemaAttributes: Array.isArray(seed.schema_attributes) ? seed.schema_attributes : [],
            weight: seed.weight ?? 1,
          })),
          hyperparameters: typeof workflowRow.hyperparameters === 'object' && workflowRow.hyperparameters !== null
            ? workflowRow.hyperparameters
            : {},
        };
        setSelectedWorkflow(details);
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to load workflow details');
      setSelectedWorkflow(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAttributePrompt = useCallback(async (workflowId: string, attrKey: string, enrichmentPrompt: string) => {
    setError(null);
    const response = await fetch(`${BASE_URL}/workflows/${workflowId}/attributes/${encodeURIComponent(attrKey)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrichmentPrompt }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update attribute ${attrKey}`);
    }

    const data = await response.json();
    setSelectedWorkflow((prev) => {
      if (!prev || prev.id !== workflowId) return prev;
      return {
        ...prev,
        attributes: prev.attributes.map((attr) =>
          attr.key === attrKey
            ? { ...attr, enrichmentPrompt: data.attribute.enrichment_prompt ?? '' }
            : attr,
        ),
      };
    });

    return {
      key: data.attribute.attr_key,
      label: data.attribute.label,
      category: data.attribute.category ?? null,
      description: data.attribute.description ?? null,
      weight: data.attribute.weight ?? null,
      enrichmentPrompt: data.attribute.enrichment_prompt ?? '',
    } as WorkflowAttribute;
  }, []);

  const enqueueWorkflow = useCallback(async (workflowId: string, prompt: string) => {
    const response = await fetch(`${BASE_URL}/workflows/${workflowId}/enqueue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      throw new Error(`Failed to enqueue workflow ${workflowId}`);
    }
    return response.json();
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    workflows,
    selectedWorkflow,
    loading,
    error,
    fetchWorkflows,
    fetchWorkflowDetails,
    updateAttributePrompt,
    enqueueWorkflow,
    setSelectedWorkflow,
  };
};
