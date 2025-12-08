export interface ComponentBundleComponentConfig {
  id: string;
  type: string;
  config: Record<string, unknown>;
}

export interface ComponentBundle {
  id: string;
  name: string;
  description?: string;
  components: ComponentBundleComponentConfig[];
  config?: Record<string, unknown>;
  mock_data_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateComponentBundleRequest {
  name: string;
  description?: string;
  components: ComponentBundleComponentConfig[];
  config?: Record<string, unknown>;
  mockDataEnabled?: boolean;
}

export interface GenerateBundleRequest {
  prompt: string;
  selectedComponents: string[];
  mockDataEnabled: boolean;
}

export interface GenerateBundleResponse {
  name: string;
  description: string;
  components: ComponentBundleComponentConfig[];
  dataSources?: unknown[];
  mockData: boolean;
}

const BASE_URL = '/api/component-bundles';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Request failed';
    try {
      const payload = await response.json();
      message = payload?.error ?? message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return response.json();
}

export async function fetchBundles(): Promise<ComponentBundle[]> {
  const response = await fetch(`${BASE_URL}/bundles`);
  const data = await handleResponse<{ bundles: ComponentBundle[] }>(response);
  return data.bundles;
}

export async function createBundle(payload: CreateComponentBundleRequest): Promise<ComponentBundle> {
  const response = await fetch(`${BASE_URL}/bundles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ bundle: ComponentBundle }>(response);
  return data.bundle;
}

export async function deleteBundle(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/bundles/${id}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
}

export async function generateBundle(
  payload: GenerateBundleRequest,
): Promise<GenerateBundleResponse> {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<GenerateBundleResponse>(response);
}
