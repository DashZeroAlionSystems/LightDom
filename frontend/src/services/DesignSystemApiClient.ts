/**
 * Design System API Client
 * 
 * Frontend client for interacting with the Design System Database API.
 * Provides methods to:
 * - Load design system configuration
 * - Fetch styleguide rules
 * - Load React components from database
 * - Create/update components
 * - Sync with Storybook
 */

const API_BASE = '/api/design-system';

export interface DesignSystemConfig {
  id: number;
  name: string;
  version: string;
  tokens: Record<string, any>;
  theme_config: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StyleguideRule {
  id: number;
  design_system_id: number;
  category: string;
  rule_name: string;
  rule_description: string;
  rule_config: Record<string, any>;
  examples: any[];
  severity: 'error' | 'warning' | 'info';
  active: boolean;
}

export interface StorybookEntry {
  id: number;
  design_system_id: number;
  component_id: number;
  story_name: string;
  story_path: string;
  story_kind: string;
  story_config: Record<string, any>;
  args_config: Record<string, any>;
  decorators: any[];
  parameters: Record<string, any>;
  tags: string[];
  active: boolean;
}

export interface DesignSystemComponent {
  id: number;
  design_system_id: number;
  name: string;
  display_name: string;
  description: string;
  category: 'atoms' | 'molecules' | 'organisms' | 'templates' | 'pages';
  component_code: string;
  props_schema: Record<string, any>;
  default_props: Record<string, any>;
  css_styles: string;
  dependencies: string[];
  internal_dependencies: string[];
  usage_examples: any[];
  version: string;
  status: 'draft' | 'review' | 'published' | 'deprecated';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DesignSystemTheme {
  id: number;
  design_system_id: number;
  name: string;
  description: string;
  theme_type: 'light' | 'dark' | 'custom';
  color_tokens: Record<string, any>;
  typography_tokens: Record<string, any>;
  spacing_tokens: Record<string, any>;
  elevation_tokens: Record<string, any>;
  active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

class DesignSystemApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // ============================================================================
  // Design System Config
  // ============================================================================

  async getConfigs(): Promise<ApiResponse<DesignSystemConfig[]>> {
    return this.request<DesignSystemConfig[]>('/config');
  }

  async getActiveConfig(): Promise<ApiResponse<DesignSystemConfig>> {
    return this.request<DesignSystemConfig>('/config/active');
  }

  async getConfig(id: number): Promise<ApiResponse<DesignSystemConfig>> {
    return this.request<DesignSystemConfig>(`/config/${id}`);
  }

  async createConfig(config: Partial<DesignSystemConfig>): Promise<ApiResponse<DesignSystemConfig>> {
    return this.request<DesignSystemConfig>('/config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async updateConfig(id: number, updates: Partial<DesignSystemConfig>): Promise<ApiResponse<DesignSystemConfig>> {
    return this.request<DesignSystemConfig>(`/config/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // ============================================================================
  // Styleguide Rules
  // ============================================================================

  async getStyleguideRules(designSystemId: number): Promise<ApiResponse<StyleguideRule[]>> {
    return this.request<StyleguideRule[]>(`/styleguide/${designSystemId}`);
  }

  async getStyleguideRulesByCategory(
    designSystemId: number,
    category: string
  ): Promise<ApiResponse<StyleguideRule[]>> {
    return this.request<StyleguideRule[]>(`/styleguide/${designSystemId}/${category}`);
  }

  async createStyleguideRule(rule: Partial<StyleguideRule>): Promise<ApiResponse<StyleguideRule>> {
    return this.request<StyleguideRule>('/styleguide', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async updateStyleguideRule(id: number, updates: Partial<StyleguideRule>): Promise<ApiResponse<StyleguideRule>> {
    return this.request<StyleguideRule>(`/styleguide/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStyleguideRule(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/styleguide/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // Components
  // ============================================================================

  async getComponents(options?: {
    designSystemId?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<DesignSystemComponent[]>> {
    const params = new URLSearchParams();
    if (options?.designSystemId) params.append('designSystemId', options.designSystemId.toString());
    if (options?.category) params.append('category', options.category);
    if (options?.status) params.append('status', options.status);
    if (options?.search) params.append('search', options.search);
    
    const query = params.toString();
    return this.request<DesignSystemComponent[]>(`/components${query ? `?${query}` : ''}`);
  }

  async getComponent(id: number): Promise<ApiResponse<DesignSystemComponent>> {
    return this.request<DesignSystemComponent>(`/components/${id}`);
  }

  async getComponentByName(name: string, designSystemId?: number): Promise<ApiResponse<DesignSystemComponent>> {
    const params = designSystemId ? `?designSystemId=${designSystemId}` : '';
    return this.request<DesignSystemComponent>(`/components/name/${name}${params}`);
  }

  async getComponentCode(id: number): Promise<ApiResponse<{
    name: string;
    code: string;
    css: string;
    props: Record<string, any>;
    defaults: Record<string, any>;
  }>> {
    return this.request(`/components/${id}/code`);
  }

  async createComponent(component: Partial<DesignSystemComponent>): Promise<ApiResponse<DesignSystemComponent>> {
    return this.request<DesignSystemComponent>('/components', {
      method: 'POST',
      body: JSON.stringify(component),
    });
  }

  async updateComponent(id: number, updates: Partial<DesignSystemComponent>): Promise<ApiResponse<DesignSystemComponent>> {
    return this.request<DesignSystemComponent>(`/components/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteComponent(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/components/${id}`, { method: 'DELETE' });
  }

  async bulkImportComponents(components: Partial<DesignSystemComponent>[]): Promise<ApiResponse<DesignSystemComponent[]>> {
    return this.request<DesignSystemComponent[]>('/components/bulk', {
      method: 'POST',
      body: JSON.stringify({ components }),
    });
  }

  // ============================================================================
  // Storybook
  // ============================================================================

  async getStorybookEntries(designSystemId?: number): Promise<ApiResponse<StorybookEntry[]>> {
    const params = designSystemId ? `?designSystemId=${designSystemId}` : '';
    return this.request<StorybookEntry[]>(`/storybook${params}`);
  }

  async getStorybookEntriesForComponent(componentId: number): Promise<ApiResponse<StorybookEntry[]>> {
    return this.request<StorybookEntry[]>(`/storybook/component/${componentId}`);
  }

  async createStorybookEntry(entry: Partial<StorybookEntry>): Promise<ApiResponse<StorybookEntry>> {
    return this.request<StorybookEntry>('/storybook', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async generateStorybookEntry(componentId: number): Promise<ApiResponse<StorybookEntry>> {
    return this.request<StorybookEntry>(`/storybook/generate/${componentId}`, {
      method: 'POST',
    });
  }

  async updateStorybookEntry(id: number, updates: Partial<StorybookEntry>): Promise<ApiResponse<StorybookEntry>> {
    return this.request<StorybookEntry>(`/storybook/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStorybookEntry(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/storybook/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // Themes
  // ============================================================================

  async getThemes(designSystemId: number): Promise<ApiResponse<DesignSystemTheme[]>> {
    return this.request<DesignSystemTheme[]>(`/themes/${designSystemId}`);
  }

  async createTheme(theme: Partial<DesignSystemTheme>): Promise<ApiResponse<DesignSystemTheme>> {
    return this.request<DesignSystemTheme>('/themes', {
      method: 'POST',
      body: JSON.stringify(theme),
    });
  }

  // ============================================================================
  // Sync Operations
  // ============================================================================

  async syncAll(name?: string): Promise<ApiResponse<any>> {
    return this.request('/sync', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async syncTokens(name?: string): Promise<ApiResponse<any>> {
    return this.request('/sync/tokens', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async syncStyleguide(): Promise<ApiResponse<any>> {
    return this.request('/sync/styleguide', { method: 'POST' });
  }

  async exportDesignSystem(designSystemId: number): Promise<ApiResponse<{
    config: DesignSystemConfig;
    rules: StyleguideRule[];
    components: DesignSystemComponent[];
    themes: DesignSystemTheme[];
    storybook: StorybookEntry[];
  }>> {
    return this.request(`/export/${designSystemId}`);
  }

  // ============================================================================
  // Component Variants
  // ============================================================================

  async getComponentVariants(componentId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/variants/${componentId}`);
  }

  async createComponentVariant(variant: any): Promise<ApiResponse<any>> {
    return this.request('/variants', {
      method: 'POST',
      body: JSON.stringify(variant),
    });
  }
}

// Export singleton instance
export const designSystemApi = new DesignSystemApiClient();

// Export class for custom instances
export default DesignSystemApiClient;
