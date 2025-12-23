/**
 * Design System Database Service
 * 
 * Provides database operations for:
 * - Design system configuration
 * - Styleguide rules
 * - Storybook entries
 * - Reusable React components
 * 
 * This service allows storing and loading design system components
 * from the database for dynamic component rendering.
 */

import { getDatabase, DatabaseAccessLayer } from './DatabaseAccessLayer';

// Types
export interface DesignSystemConfig {
  id?: number;
  name: string;
  version: string;
  tokens: Record<string, any>;
  theme_config: Record<string, any>;
  active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface StyleguideRule {
  id?: number;
  design_system_id: number;
  category: string;
  rule_name: string;
  rule_description?: string;
  rule_config: Record<string, any>;
  examples?: any[];
  severity?: 'error' | 'warning' | 'info';
  active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface StorybookEntry {
  id?: number;
  design_system_id?: number;
  component_id?: number;
  story_name: string;
  story_path: string;
  story_kind: 'story' | 'docs' | 'autodocs';
  story_config: Record<string, any>;
  args_config?: Record<string, any>;
  decorators?: any[];
  parameters?: Record<string, any>;
  tags?: string[];
  active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface DesignSystemComponent {
  id?: number;
  design_system_id?: number;
  name: string;
  display_name?: string;
  description?: string;
  category?: 'atoms' | 'molecules' | 'organisms' | 'templates' | 'pages';
  component_code: string;
  props_schema?: Record<string, any>;
  default_props?: Record<string, any>;
  css_styles?: string;
  dependencies?: string[];
  internal_dependencies?: string[];
  usage_examples?: any[];
  version?: string;
  status?: 'draft' | 'review' | 'published' | 'deprecated';
  preview_url?: string;
  figma_link?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface DesignSystemTheme {
  id?: number;
  design_system_id: number;
  name: string;
  description?: string;
  theme_type: 'light' | 'dark' | 'custom';
  color_tokens: Record<string, any>;
  typography_tokens?: Record<string, any>;
  spacing_tokens?: Record<string, any>;
  elevation_tokens?: Record<string, any>;
  active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface ComponentVariant {
  id?: number;
  component_id: number;
  variant_name: string;
  variant_props: Record<string, any>;
  variant_code?: string;
  description?: string;
  preview_url?: string;
  created_at?: Date;
}

/**
 * Design System Database Service
 */
export class DesignSystemDatabaseService {
  private db: DatabaseAccessLayer;

  constructor(db?: DatabaseAccessLayer) {
    this.db = db || getDatabase();
  }

  /**
   * Initialize the database connection
   */
  async initialize(): Promise<void> {
    await this.db.initialize();
  }

  // ============================================================================
  // Design System Config Operations
  // ============================================================================

  async createDesignSystemConfig(config: DesignSystemConfig): Promise<DesignSystemConfig> {
    return await this.db.insert('design_system_config', {
      name: config.name,
      version: config.version,
      tokens: JSON.stringify(config.tokens),
      theme_config: JSON.stringify(config.theme_config),
      active: config.active ?? true,
    });
  }

  async getDesignSystemConfig(id: number): Promise<DesignSystemConfig | null> {
    const results = await this.db.select('design_system_config', {
      where: 'id = $1',
      whereParams: [id],
    });
    return results[0] || null;
  }

  async getDesignSystemConfigByName(name: string): Promise<DesignSystemConfig | null> {
    const results = await this.db.select('design_system_config', {
      where: 'name = $1',
      whereParams: [name],
    });
    return results[0] || null;
  }

  async getActiveDesignSystemConfig(): Promise<DesignSystemConfig | null> {
    const results = await this.db.select('design_system_config', {
      where: 'active = true',
      orderBy: 'created_at DESC',
      limit: 1,
    });
    return results[0] || null;
  }

  async updateDesignSystemConfig(id: number, updates: Partial<DesignSystemConfig>): Promise<DesignSystemConfig[]> {
    const data: Record<string, any> = {};
    if (updates.name) data.name = updates.name;
    if (updates.version) data.version = updates.version;
    if (updates.tokens) data.tokens = JSON.stringify(updates.tokens);
    if (updates.theme_config) data.theme_config = JSON.stringify(updates.theme_config);
    if (updates.active !== undefined) data.active = updates.active;
    
    return await this.db.update('design_system_config', data, 'id = $' + (Object.keys(data).length + 1), [id]);
  }

  async listDesignSystemConfigs(): Promise<DesignSystemConfig[]> {
    return await this.db.select('design_system_config', {
      orderBy: 'created_at DESC',
    });
  }

  // ============================================================================
  // Styleguide Rules Operations
  // ============================================================================

  async createStyleguideRule(rule: StyleguideRule): Promise<StyleguideRule> {
    return await this.db.insert('styleguide_rules', {
      design_system_id: rule.design_system_id,
      category: rule.category,
      rule_name: rule.rule_name,
      rule_description: rule.rule_description,
      rule_config: JSON.stringify(rule.rule_config),
      examples: JSON.stringify(rule.examples || []),
      severity: rule.severity || 'warning',
      active: rule.active ?? true,
    });
  }

  async getStyleguideRules(designSystemId: number): Promise<StyleguideRule[]> {
    return await this.db.select('styleguide_rules', {
      where: 'design_system_id = $1 AND active = true',
      whereParams: [designSystemId],
      orderBy: 'category, rule_name',
    });
  }

  async getStyleguideRulesByCategory(designSystemId: number, category: string): Promise<StyleguideRule[]> {
    return await this.db.select('styleguide_rules', {
      where: 'design_system_id = $1 AND category = $2 AND active = true',
      whereParams: [designSystemId, category],
      orderBy: 'rule_name',
    });
  }

  async updateStyleguideRule(id: number, updates: Partial<StyleguideRule>): Promise<StyleguideRule[]> {
    const data: Record<string, any> = {};
    if (updates.rule_description) data.rule_description = updates.rule_description;
    if (updates.rule_config) data.rule_config = JSON.stringify(updates.rule_config);
    if (updates.examples) data.examples = JSON.stringify(updates.examples);
    if (updates.severity) data.severity = updates.severity;
    if (updates.active !== undefined) data.active = updates.active;
    
    return await this.db.update('styleguide_rules', data, 'id = $' + (Object.keys(data).length + 1), [id]);
  }

  async deleteStyleguideRule(id: number): Promise<void> {
    await this.db.query('DELETE FROM styleguide_rules WHERE id = $1', [id]);
  }

  // ============================================================================
  // Storybook Entry Operations
  // ============================================================================

  async createStorybookEntry(entry: StorybookEntry): Promise<StorybookEntry> {
    return await this.db.insert('storybook_entries', {
      design_system_id: entry.design_system_id,
      component_id: entry.component_id,
      story_name: entry.story_name,
      story_path: entry.story_path,
      story_kind: entry.story_kind,
      story_config: JSON.stringify(entry.story_config),
      args_config: JSON.stringify(entry.args_config || {}),
      decorators: JSON.stringify(entry.decorators || []),
      parameters: JSON.stringify(entry.parameters || {}),
      tags: entry.tags || ['autodocs'],
      active: entry.active ?? true,
    });
  }

  async getStorybookEntries(designSystemId?: number): Promise<StorybookEntry[]> {
    if (designSystemId) {
      return await this.db.select('storybook_entries', {
        where: 'design_system_id = $1 AND active = true',
        whereParams: [designSystemId],
        orderBy: 'story_path, story_name',
      });
    }
    return await this.db.select('storybook_entries', {
      where: 'active = true',
      orderBy: 'story_path, story_name',
    });
  }

  async getStorybookEntriesByComponent(componentId: number): Promise<StorybookEntry[]> {
    return await this.db.select('storybook_entries', {
      where: 'component_id = $1 AND active = true',
      whereParams: [componentId],
      orderBy: 'story_name',
    });
  }

  async updateStorybookEntry(id: number, updates: Partial<StorybookEntry>): Promise<StorybookEntry[]> {
    const data: Record<string, any> = {};
    if (updates.story_name) data.story_name = updates.story_name;
    if (updates.story_path) data.story_path = updates.story_path;
    if (updates.story_kind) data.story_kind = updates.story_kind;
    if (updates.story_config) data.story_config = JSON.stringify(updates.story_config);
    if (updates.args_config) data.args_config = JSON.stringify(updates.args_config);
    if (updates.decorators) data.decorators = JSON.stringify(updates.decorators);
    if (updates.parameters) data.parameters = JSON.stringify(updates.parameters);
    if (updates.tags) data.tags = updates.tags;
    if (updates.active !== undefined) data.active = updates.active;
    
    return await this.db.update('storybook_entries', data, 'id = $' + (Object.keys(data).length + 1), [id]);
  }

  async deleteStorybookEntry(id: number): Promise<void> {
    await this.db.query('DELETE FROM storybook_entries WHERE id = $1', [id]);
  }

  // ============================================================================
  // Component Operations
  // ============================================================================

  async createComponent(component: DesignSystemComponent): Promise<DesignSystemComponent> {
    return await this.db.insert('design_system_components', {
      design_system_id: component.design_system_id,
      name: component.name,
      display_name: component.display_name || component.name,
      description: component.description,
      category: component.category,
      component_code: component.component_code,
      props_schema: JSON.stringify(component.props_schema || {}),
      default_props: JSON.stringify(component.default_props || {}),
      css_styles: component.css_styles,
      dependencies: JSON.stringify(component.dependencies || []),
      internal_dependencies: component.internal_dependencies || [],
      usage_examples: JSON.stringify(component.usage_examples || []),
      version: component.version || '1.0.0',
      status: component.status || 'draft',
      preview_url: component.preview_url,
      figma_link: component.figma_link,
      tags: component.tags || [],
      metadata: JSON.stringify(component.metadata || {}),
      created_by: component.created_by,
    });
  }

  async getComponent(id: number): Promise<DesignSystemComponent | null> {
    const results = await this.db.select('design_system_components', {
      where: 'id = $1',
      whereParams: [id],
    });
    return results[0] || null;
  }

  async getComponentByName(name: string, designSystemId?: number): Promise<DesignSystemComponent | null> {
    if (designSystemId) {
      const results = await this.db.select('design_system_components', {
        where: 'name = $1 AND design_system_id = $2',
        whereParams: [name, designSystemId],
      });
      return results[0] || null;
    }
    const results = await this.db.select('design_system_components', {
      where: 'name = $1',
      whereParams: [name],
      orderBy: 'created_at DESC',
      limit: 1,
    });
    return results[0] || null;
  }

  async getPublishedComponents(designSystemId?: number): Promise<DesignSystemComponent[]> {
    if (designSystemId) {
      return await this.db.select('design_system_components', {
        where: "design_system_id = $1 AND status = 'published'",
        whereParams: [designSystemId],
        orderBy: 'category, name',
      });
    }
    return await this.db.select('design_system_components', {
      where: "status = 'published'",
      orderBy: 'category, name',
    });
  }

  async getComponentsByCategory(category: string, designSystemId?: number): Promise<DesignSystemComponent[]> {
    if (designSystemId) {
      return await this.db.select('design_system_components', {
        where: 'category = $1 AND design_system_id = $2',
        whereParams: [category, designSystemId],
        orderBy: 'name',
      });
    }
    return await this.db.select('design_system_components', {
      where: 'category = $1',
      whereParams: [category],
      orderBy: 'name',
    });
  }

  async searchComponents(query: string, designSystemId?: number): Promise<DesignSystemComponent[]> {
    const searchQuery = `%${query}%`;
    if (designSystemId) {
      return await this.db.select('design_system_components', {
        where: '(name ILIKE $1 OR display_name ILIKE $1 OR description ILIKE $1) AND design_system_id = $2',
        whereParams: [searchQuery, designSystemId],
        orderBy: 'name',
      });
    }
    return await this.db.select('design_system_components', {
      where: 'name ILIKE $1 OR display_name ILIKE $1 OR description ILIKE $1',
      whereParams: [searchQuery],
      orderBy: 'name',
    });
  }

  async updateComponent(id: number, updates: Partial<DesignSystemComponent>): Promise<DesignSystemComponent[]> {
    const data: Record<string, any> = {};
    if (updates.display_name) data.display_name = updates.display_name;
    if (updates.description) data.description = updates.description;
    if (updates.category) data.category = updates.category;
    if (updates.component_code) data.component_code = updates.component_code;
    if (updates.props_schema) data.props_schema = JSON.stringify(updates.props_schema);
    if (updates.default_props) data.default_props = JSON.stringify(updates.default_props);
    if (updates.css_styles) data.css_styles = updates.css_styles;
    if (updates.dependencies) data.dependencies = JSON.stringify(updates.dependencies);
    if (updates.internal_dependencies) data.internal_dependencies = updates.internal_dependencies;
    if (updates.usage_examples) data.usage_examples = JSON.stringify(updates.usage_examples);
    if (updates.version) data.version = updates.version;
    if (updates.status) data.status = updates.status;
    if (updates.preview_url) data.preview_url = updates.preview_url;
    if (updates.figma_link) data.figma_link = updates.figma_link;
    if (updates.tags) data.tags = updates.tags;
    if (updates.metadata) data.metadata = JSON.stringify(updates.metadata);
    
    return await this.db.update('design_system_components', data, 'id = $' + (Object.keys(data).length + 1), [id]);
  }

  async deleteComponent(id: number): Promise<void> {
    await this.db.query('DELETE FROM design_system_components WHERE id = $1', [id]);
  }

  async listAllComponents(designSystemId?: number): Promise<DesignSystemComponent[]> {
    if (designSystemId) {
      return await this.db.select('design_system_components', {
        where: 'design_system_id = $1',
        whereParams: [designSystemId],
        orderBy: 'category, name',
      });
    }
    return await this.db.select('design_system_components', {
      orderBy: 'category, name',
    });
  }

  // ============================================================================
  // Theme Operations
  // ============================================================================

  async createTheme(theme: DesignSystemTheme): Promise<DesignSystemTheme> {
    return await this.db.insert('design_system_themes', {
      design_system_id: theme.design_system_id,
      name: theme.name,
      description: theme.description,
      theme_type: theme.theme_type,
      color_tokens: JSON.stringify(theme.color_tokens),
      typography_tokens: JSON.stringify(theme.typography_tokens || {}),
      spacing_tokens: JSON.stringify(theme.spacing_tokens || {}),
      elevation_tokens: JSON.stringify(theme.elevation_tokens || {}),
      active: theme.active ?? true,
    });
  }

  async getThemes(designSystemId: number): Promise<DesignSystemTheme[]> {
    return await this.db.select('design_system_themes', {
      where: 'design_system_id = $1 AND active = true',
      whereParams: [designSystemId],
      orderBy: 'name',
    });
  }

  async getActiveTheme(designSystemId: number, themeType: string): Promise<DesignSystemTheme | null> {
    const results = await this.db.select('design_system_themes', {
      where: 'design_system_id = $1 AND theme_type = $2 AND active = true',
      whereParams: [designSystemId, themeType],
      limit: 1,
    });
    return results[0] || null;
  }

  // ============================================================================
  // Component Variants Operations
  // ============================================================================

  async createComponentVariant(variant: ComponentVariant): Promise<ComponentVariant> {
    return await this.db.insert('component_variants', {
      component_id: variant.component_id,
      variant_name: variant.variant_name,
      variant_props: JSON.stringify(variant.variant_props),
      variant_code: variant.variant_code,
      description: variant.description,
      preview_url: variant.preview_url,
    });
  }

  async getComponentVariants(componentId: number): Promise<ComponentVariant[]> {
    return await this.db.select('component_variants', {
      where: 'component_id = $1',
      whereParams: [componentId],
      orderBy: 'variant_name',
    });
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  async bulkImportComponents(components: DesignSystemComponent[]): Promise<DesignSystemComponent[]> {
    const results: DesignSystemComponent[] = [];
    for (const component of components) {
      const result = await this.createComponent(component);
      results.push(result);
    }
    return results;
  }

  async bulkImportStyleguideRules(rules: StyleguideRule[]): Promise<StyleguideRule[]> {
    const results: StyleguideRule[] = [];
    for (const rule of rules) {
      const result = await this.createStyleguideRule(rule);
      results.push(result);
    }
    return results;
  }

  /**
   * Export entire design system to JSON
   */
  async exportDesignSystem(designSystemId: number): Promise<{
    config: DesignSystemConfig | null;
    rules: StyleguideRule[];
    components: DesignSystemComponent[];
    themes: DesignSystemTheme[];
    storybook: StorybookEntry[];
  }> {
    const config = await this.getDesignSystemConfig(designSystemId);
    const rules = await this.getStyleguideRules(designSystemId);
    const components = await this.listAllComponents(designSystemId);
    const themes = await this.getThemes(designSystemId);
    const storybook = await this.getStorybookEntries(designSystemId);

    return { config, rules, components, themes, storybook };
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.db.close();
  }
}

// Singleton instance
let serviceInstance: DesignSystemDatabaseService | null = null;

/**
 * Get Design System Database Service instance
 */
export function getDesignSystemDatabaseService(): DesignSystemDatabaseService {
  if (!serviceInstance) {
    serviceInstance = new DesignSystemDatabaseService();
  }
  return serviceInstance;
}

export default DesignSystemDatabaseService;
