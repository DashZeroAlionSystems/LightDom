import { useCallback, useMemo, useState } from 'react';

const BASE_URL = '/api/workflow-admin/neural';

export interface NeuralInstanceSummary {
  id: string;
  workflowId: string | null;
  workflowInstanceId: string | null;
  label: string;
  modelType: string;
  currentVersion: string | null;
  status: string;
  automationEnabled: boolean;
  config: Record<string, any>;
  metrics: Record<string, any>;
  lastTrainedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NeuralTrainingRun {
  id: string;
  neuralInstanceId: string;
  trainingJobId: string | null;
  workflowRunId: string | null;
  status: string;
  datasetOverview: Record<string, any>;
  hyperparameters: Record<string, any>;
  metrics: Record<string, any>;
  notes: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface NeuralSchemaVersion {
  id: string;
  neuralInstanceId: string;
  version: number;
  schemaSnapshot: Record<string, any>;
  attributes: any[];
  discoveredLinks: any[];
  createdAt: string;
}

export interface NeuralSchemaLink {
  id: string;
  workflowId: string;
  sourceType: string;
  sourceId: string | null;
  schemaUri: string;
  relation: Record<string, any>;
  confidence: number | null;
  metadata: Record<string, any>;
  discoveredAt: string;
}

export interface NeuralAttributeSuggestion {
  id: string;
  workflowId: string;
  suggestion: Record<string, any>;
  confidence: number | null;
  status: string;
  createdAt: string;
  appliedAt: string | null;
  appliedAttributeId: string | null;
}

export interface NeuralInstanceDetails extends NeuralInstanceSummary {
  trainingRuns: NeuralTrainingRun[];
  schemaVersions: NeuralSchemaVersion[];
  schemaLinks: NeuralSchemaLink[];
  attributeSuggestions: NeuralAttributeSuggestion[];
}

interface FetchInstancesOptions {
  workflowId?: string;
}

const mapInstance = (row: any): NeuralInstanceSummary => ({
  id: String(row.id),
  workflowId: row.workflow_id ?? null,
  workflowInstanceId: row.workflow_instance_id ?? null,
  label: row.label,
  modelType: row.model_type,
  currentVersion: row.current_version ?? null,
  status: row.status,
  automationEnabled: Boolean(row.automation_enabled),
  config: row.config ?? {},
  metrics: row.metrics ?? {},
  lastTrainedAt: row.last_trained_at ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapTrainingRun = (row: any): NeuralTrainingRun => ({
  id: String(row.id),
  neuralInstanceId: row.neural_instance_id,
  trainingJobId: row.training_job_id ?? null,
  workflowRunId: row.workflow_run_id ?? null,
  status: row.status,
  datasetOverview: row.dataset_overview ?? {},
  hyperparameters: row.hyperparameters ?? {},
  metrics: row.metrics ?? {},
  notes: row.notes ?? null,
  startedAt: row.started_at,
  completedAt: row.completed_at ?? null,
});

const mapSchemaVersion = (row: any): NeuralSchemaVersion => ({
  id: String(row.id),
  neuralInstanceId: row.neural_instance_id,
  version: Number(row.version),
  schemaSnapshot: row.schema_snapshot ?? {},
  attributes: Array.isArray(row.attributes) ? row.attributes : [],
  discoveredLinks: Array.isArray(row.discovered_links) ? row.discovered_links : [],
  createdAt: row.created_at,
});

const mapSchemaLink = (row: any): NeuralSchemaLink => ({
  id: String(row.id),
  workflowId: row.workflow_id,
  sourceType: row.source_type,
  sourceId: row.source_id ?? null,
  schemaUri: row.schema_uri,
  relation: row.relation ?? {},
  confidence: row.confidence ?? null,
  metadata: row.metadata ?? {},
  discoveredAt: row.discovered_at,
});

const mapAttributeSuggestion = (row: any): NeuralAttributeSuggestion => ({
  id: String(row.id),
  workflowId: row.workflow_id,
  suggestion: row.suggestion ?? {},
  confidence: row.confidence ?? null,
  status: row.status,
  createdAt: row.created_at,
  appliedAt: row.applied_at ?? null,
  appliedAttributeId: row.applied_attribute_id ?? null,
});

export const useNeuralInstances = () => {
  const [instances, setInstances] = useState<NeuralInstanceSummary[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<NeuralInstanceDetails | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstanceDetails = useCallback(async (instanceId: string) => {
    setDetailLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/instances/${instanceId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch neural instance ${instanceId}`);
      }

      const data = await response.json();
      if (!data.instance) {
        throw new Error('Instance payload missing in response');
      }

      const mappedInstance = mapInstance(data.instance);
      const details: NeuralInstanceDetails = {
        ...mappedInstance,
        trainingRuns: Array.isArray(data.trainingRuns) ? data.trainingRuns.map(mapTrainingRun) : [],
        schemaVersions: Array.isArray(data.schemaVersions) ? data.schemaVersions.map(mapSchemaVersion) : [],
        schemaLinks: Array.isArray(data.schemaLinks) ? data.schemaLinks.map(mapSchemaLink) : [],
        attributeSuggestions: Array.isArray(data.attributeSuggestions)
          ? data.attributeSuggestions.map(mapAttributeSuggestion)
          : [],
      };

      setSelectedInstanceId(mappedInstance.id);
      setSelectedInstance(details);

      setInstances((prev) => {
        const hasInstance = prev.some((item) => item.id === mappedInstance.id);
        if (!hasInstance) {
          return [...prev, mappedInstance].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
        return prev.map((item) => (item.id === mappedInstance.id ? mappedInstance : item));
      });

      return details;
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch neural instance');
      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchInstances = useCallback(
    async (options: FetchInstancesOptions = {}) => {
      setListLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options.workflowId) {
          params.set('workflowId', options.workflowId);
        }

        const response = await fetch(
          `${BASE_URL}/instances${params.toString().length ? `?${params.toString()}` : ''}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to list neural instances: ${response.status}`);
        }

        const data = await response.json();
        const mapped: NeuralInstanceSummary[] = Array.isArray(data.instances)
          ? data.instances.map(mapInstance)
          : [];

        setInstances(mapped);

        if (!selectedInstanceId && mapped.length) {
          await fetchInstanceDetails(mapped[0].id);
        }

        return mapped;
      } catch (err: any) {
        setError(err.message ?? 'Failed to list neural instances');
        throw err;
      } finally {
        setListLoading(false);
      }
    },
    [fetchInstanceDetails, selectedInstanceId],
  );

  const selectInstance = useCallback(
    async (instanceId: string) => {
      setSelectedInstanceId(instanceId);
      return fetchInstanceDetails(instanceId);
    },
    [fetchInstanceDetails],
  );

  const refreshSelectedInstance = useCallback(async () => {
    if (!selectedInstanceId) return null;
    return fetchInstanceDetails(selectedInstanceId);
  }, [fetchInstanceDetails, selectedInstanceId]);

  const toggleAutomation = useCallback(
    async (instanceId: string, automationEnabled: boolean) => {
      setError(null);
      const response = await fetch(`${BASE_URL}/instances/${instanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automationEnabled }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update neural instance ${instanceId}`);
      }

      const data = await response.json();
      if (!data.instance) {
        throw new Error('Missing instance payload after update');
      }

      const mapped = mapInstance(data.instance);
      setInstances((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
      setSelectedInstance((prev) => (prev && prev.id === mapped.id ? { ...prev, ...mapped } : prev));
      return mapped;
    },
    [],
  );

  const pendingSuggestionCount = useMemo(
    () =>
      selectedInstance?.attributeSuggestions.filter((suggestion) => suggestion.status === 'pending').length ?? 0,
    [selectedInstance],
  );

  return {
    instances,
    selectedInstance,
    selectedInstanceId,
    listLoading,
    detailLoading,
    error,
    fetchInstances,
    selectInstance,
    refreshSelectedInstance,
    toggleAutomation,
    pendingSuggestionCount,
  };
};
