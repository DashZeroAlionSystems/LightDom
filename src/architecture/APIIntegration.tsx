import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';

// API Configuration
interface APIConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  cacheTime: number;
  staleTime: number;
}

const DEFAULT_CONFIG: APIConfig = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  retries: 3,
  cacheTime: 5 * 60 * 1000, // 5 minutes
  staleTime: 30 * 1000 // 30 seconds
};

// HTTP Client with advanced features
class APIClient {
  private config: APIConfig;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor(config: Partial<APIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    try {
      return await this.request<T>(endpoint, options);
    } catch (error) {
      if (attempt < this.config.retries && this.isRetryableError(error)) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.requestWithRetry<T>(endpoint, options, attempt + 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    // Retry on network errors, 5xx errors, timeout
    return error.name === 'TypeError' ||
           error.message.includes('500') ||
           error.message.includes('502') ||
           error.message.includes('503') ||
           error.message.includes('504') ||
           error.message === 'Request timeout';
  }

  // Cache management
  private getCacheKey(endpoint: string, method: string = 'GET'): string {
    return `${method}:${endpoint}`;
  }

  protected get<T>(endpoint: string): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return Promise.resolve(cached.data);
    }

    return this.requestWithRetry<T>(endpoint);
  }

  protected post<T>(endpoint: string, data?: any): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected put<T>(endpoint: string, data?: any): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected delete<T>(endpoint: string): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Cache methods
  setCache(endpoint: string, data: any, ttl: number = this.config.cacheTime): void {
    const cacheKey = this.getCacheKey(endpoint);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clearCache(endpoint?: string): void {
    if (endpoint) {
      const cacheKey = this.getCacheKey(endpoint);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latency: number }> {
    const start = Date.now();
    try {
      await this.get('/health');
      const latency = Date.now() - start;
      return {
        status: latency < 1000 ? 'healthy' : 'degraded',
        latency
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start
      };
    }
  }
}

// API Service Classes
class DashboardAPI extends APIClient {
  async getOverview() {
    return this.get('/dashboard/overview');
  }

  async getMetrics(timeRange: string) {
    return this.get(`/dashboard/metrics?range=${timeRange}`);
  }

  async updateDashboardConfig(config: any) {
    return this.put('/dashboard/config', config);
  }
}

class NeuralNetworkAPI extends APIClient {
  async getModels() {
    return this.get('/ml/models');
  }

  async trainModel(config: any) {
    return this.post('/ml/train', config);
  }

  async getTrainingStatus(jobId: string) {
    return this.get(`/ml/train/${jobId}/status`);
  }

  async stopTraining(jobId: string) {
    return this.post(`/ml/train/${jobId}/stop`);
  }

  async getPredictions(modelId: string, input: any) {
    return this.post(`/ml/models/${modelId}/predict`, input);
  }
}

class ResearchAPI extends APIClient {
  async searchPapers(query: string, domain: string) {
    return this.get(`/research/papers?query=${encodeURIComponent(query)}&domain=${domain}`);
  }

  async getLatestFindings(domains: string[]) {
    return this.post('/research/findings', { domains });
  }

  async saveInsight(insight: any) {
    return this.post('/research/insights', insight);
  }

  async getInsights(filters: any) {
    return this.post('/research/insights/search', filters);
  }
}

class EnterpriseAPI extends APIClient {
  async getOrganizations() {
    return this.get('/enterprise/organizations');
  }

  async getUsers(orgId: string) {
    return this.get(`/enterprise/organizations/${orgId}/users`);
  }

  async updateUserPermissions(userId: string, permissions: string[]) {
    return this.put(`/enterprise/users/${userId}/permissions`, { permissions });
  }

  async getAuditLogs(filters: any) {
    return this.post('/enterprise/audit/logs', filters);
  }

  async createBackup(orgId: string) {
    return this.post(`/enterprise/organizations/${orgId}/backup`);
  }
}

// React Query Hooks
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_CONFIG.staleTime,
      cacheTime: DEFAULT_CONFIG.cacheTime,
      retry: DEFAULT_CONFIG.retries,
      refetchOnWindowFocus: false,
    },
  },
});

// Dashboard Hooks
export const useDashboardOverview = () => {
  const api = new DashboardAPI();
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.getOverview(),
  });
};

export const useDashboardMetrics = (timeRange: string) => {
  const api = new DashboardAPI();
  return useQuery({
    queryKey: ['dashboard', 'metrics', timeRange],
    queryFn: () => api.getMetrics(timeRange),
  });
};

export const useUpdateDashboardConfig = () => {
  const api = new DashboardAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: any) => api.updateDashboardConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Neural Network Hooks
export const useModels = () => {
  const api = new NeuralNetworkAPI();
  return useQuery({
    queryKey: ['ml', 'models'],
    queryFn: () => api.getModels(),
  });
};

export const useTrainModel = () => {
  const api = new NeuralNetworkAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: any) => api.trainModel(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml', 'models'] });
    },
  });
};

export const useTrainingStatus = (jobId: string) => {
  const api = new NeuralNetworkAPI();
  return useQuery({
    queryKey: ['ml', 'training', jobId],
    queryFn: () => api.getTrainingStatus(jobId),
    enabled: !!jobId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

export const usePredictions = () => {
  const api = new NeuralNetworkAPI();
  return useMutation({
    mutationFn: ({ modelId, input }: { modelId: string; input: any }) =>
      api.getPredictions(modelId, input),
  });
};

// Research Hooks
export const useResearchPapers = (query: string, domain: string) => {
  const api = new ResearchAPI();
  return useQuery({
    queryKey: ['research', 'papers', query, domain],
    queryFn: () => api.searchPapers(query, domain),
    enabled: !!query && !!domain,
  });
};

export const useLatestFindings = (domains: string[]) => {
  const api = new ResearchAPI();
  return useQuery({
    queryKey: ['research', 'findings', domains.sort().join(',')],
    queryFn: () => api.getLatestFindings(domains),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

export const useSaveInsight = () => {
  const api = new ResearchAPI();
  return useMutation({
    mutationFn: (insight: any) => api.saveInsight(insight),
  });
};

export const useInsights = (filters: any) => {
  const api = new ResearchAPI();
  return useQuery({
    queryKey: ['research', 'insights', filters],
    queryFn: () => api.getInsights(filters),
  });
};

// Enterprise Hooks
export const useOrganizations = () => {
  const api = new EnterpriseAPI();
  return useQuery({
    queryKey: ['enterprise', 'organizations'],
    queryFn: () => api.getOrganizations(),
  });
};

export const useOrganizationUsers = (orgId: string) => {
  const api = new EnterpriseAPI();
  return useQuery({
    queryKey: ['enterprise', 'organizations', orgId, 'users'],
    queryFn: () => api.getUsers(orgId),
    enabled: !!orgId,
  });
};

export const useUpdateUserPermissions = () => {
  const api = new EnterpriseAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: string; permissions: string[] }) =>
      api.updateUserPermissions(userId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise'] });
    },
  });
};

export const useAuditLogs = (filters: any) => {
  const api = new EnterpriseAPI();
  return useQuery({
    queryKey: ['enterprise', 'audit', filters],
    queryFn: () => api.getAuditLogs(filters),
  });
};

export const useCreateBackup = () => {
  const api = new EnterpriseAPI();
  return useMutation({
    mutationFn: (orgId: string) => api.createBackup(orgId),
  });
};

// Health monitoring hook
export const useAPIHealth = () => {
  const [health, setHealth] = useState<{ status: string; latency: number } | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const client = new APIClient();
      try {
        const healthStatus = await client.healthCheck();
        setHealth(healthStatus);
      } catch (error) {
        setHealth({ status: 'error', latency: 0 });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return health;
};

// Export API clients and query client
export { APIClient, DashboardAPI, NeuralNetworkAPI, ResearchAPI, EnterpriseAPI, queryClient };
export type { APIConfig };
