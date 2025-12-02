/**
 * Design System Sync Service
 * 
 * Manages the workflow between:
 * - Design System Provider (frontend)
 * - Styleguide rules
 * - Storybook entries
 * - Database persistence
 * 
 * This service provides:
 * - Sync design tokens to database
 * - Load design system from database
 * - Generate Storybook entries from components
 * - Dynamic component loading from database
 */

import {
  DesignSystemDatabaseService,
  DesignSystemConfig,
  StyleguideRule,
  StorybookEntry,
  DesignSystemComponent,
  DesignSystemTheme,
  getDesignSystemDatabaseService,
} from './DesignSystemDatabaseService';

// Import design tokens from frontend
// Note: In production, these would be dynamically imported
import { designTokens, styleguideRules } from '../../frontend/src/design-system/DesignSystemProvider';

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export interface ComponentGeneratorOptions {
  category?: string;
  includeStorybook?: boolean;
  includeVariants?: boolean;
}

/**
 * Design System Sync Service
 */
export class DesignSystemSyncService {
  private dbService: DesignSystemDatabaseService;
  private designSystemId: number | null = null;

  constructor(dbService?: DesignSystemDatabaseService) {
    this.dbService = dbService || getDesignSystemDatabaseService();
  }

  /**
   * Initialize the sync service
   */
  async initialize(): Promise<void> {
    await this.dbService.initialize();
  }

  /**
   * Sync frontend design tokens to database
   */
  async syncDesignTokensToDatabase(name: string = 'LightDom Default'): Promise<SyncResult> {
    try {
      // Check if design system already exists
      let config = await this.dbService.getDesignSystemConfigByName(name);

      if (config) {
        // Update existing
        await this.dbService.updateDesignSystemConfig(config.id!, {
          tokens: designTokens,
          theme_config: {
            defaultTheme: 'dark',
            supportedThemes: ['light', 'dark'],
          },
        });
        this.designSystemId = config.id!;
        return {
          success: true,
          message: `Design system '${name}' updated successfully`,
          data: { id: config.id },
        };
      }

      // Create new
      config = await this.dbService.createDesignSystemConfig({
        name,
        version: '1.0.0',
        tokens: designTokens,
        theme_config: {
          defaultTheme: 'dark',
          supportedThemes: ['light', 'dark'],
        },
      });

      this.designSystemId = config.id!;

      return {
        success: true,
        message: `Design system '${name}' created successfully`,
        data: { id: config.id },
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to sync design tokens: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Sync styleguide rules to database
   */
  async syncStyleguideRulesToDatabase(): Promise<SyncResult> {
    if (!this.designSystemId) {
      return {
        success: false,
        message: 'Design system not initialized. Call syncDesignTokensToDatabase first.',
      };
    }

    try {
      const errors: string[] = [];
      const rules: StyleguideRule[] = [];

      // Convert styleguideRules object to database format
      for (const [category, categoryRules] of Object.entries(styleguideRules)) {
        for (const [ruleName, ruleValue] of Object.entries(categoryRules as Record<string, any>)) {
          try {
            const rule = await this.dbService.createStyleguideRule({
              design_system_id: this.designSystemId,
              category,
              rule_name: ruleName,
              rule_description: this.generateRuleDescription(category, ruleName, ruleValue),
              rule_config: typeof ruleValue === 'object' ? ruleValue : { value: ruleValue },
              severity: 'warning',
            });
            rules.push(rule);
          } catch (err: any) {
            // If rule already exists, try to update it
            if (err.message.includes('duplicate')) {
              errors.push(`Rule ${category}.${ruleName} already exists - skipped`);
            } else {
              errors.push(`Failed to create rule ${category}.${ruleName}: ${err.message}`);
            }
          }
        }
      }

      return {
        success: true,
        message: `Synced ${rules.length} styleguide rules to database`,
        data: { count: rules.length },
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to sync styleguide rules: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Generate human-readable rule description
   */
  private generateRuleDescription(category: string, ruleName: string, value: any): string {
    const descriptions: Record<string, Record<string, string>> = {
      buttons: {
        minTouchTarget: 'Minimum touch target size for accessibility compliance (44x44px)',
        defaultHeight: 'Default button height in pixels',
        smallHeight: 'Small button variant height in pixels',
        largeHeight: 'Large button variant height in pixels',
        borderRadius: 'Button border radius value',
        loadingStateRequired: 'Whether buttons must show loading state for async actions',
      },
      cards: {
        padding: 'Card padding values for different sizes',
        borderRadius: 'Card border radius value',
        gap: 'Gap between cards in grid layouts',
      },
      inputs: {
        height: 'Input field heights for different sizes',
        borderRadius: 'Input border radius value',
        minLabelWidth: 'Minimum width for input labels',
      },
      navigation: {
        sidebarWidthExpanded: 'Sidebar width when expanded',
        sidebarWidthCollapsed: 'Sidebar width when collapsed',
        iconSize: 'Navigation icon size in pixels',
        maxLabelLength: 'Maximum character length for navigation labels',
      },
      dashboards: {
        kpiGridColumns: 'Number of columns in KPI grid on desktop',
        maxHierarchyLevels: 'Maximum levels of visual hierarchy',
        sectionGap: 'Gap between dashboard sections',
      },
      accessibility: {
        minContrastRatio: 'Minimum color contrast ratio (WCAG AA)',
        focusOutlineWidth: 'Focus outline width for interactive elements',
        focusOutlineOffset: 'Focus outline offset from element',
        minFontSize: 'Minimum font size for readability',
      },
      motion: {
        respectReducedMotion: 'Whether to respect prefers-reduced-motion',
        maxAnimationDuration: 'Maximum animation duration in milliseconds',
        defaultTransition: 'Default CSS transition value',
      },
    };

    return descriptions[category]?.[ruleName] || `${category} ${ruleName} rule`;
  }

  /**
   * Store a React component in the database
   */
  async storeComponent(component: DesignSystemComponent): Promise<SyncResult> {
    try {
      if (!this.designSystemId) {
        await this.syncDesignTokensToDatabase();
      }

      component.design_system_id = this.designSystemId!;
      const stored = await this.dbService.createComponent(component);

      return {
        success: true,
        message: `Component '${component.name}' stored successfully`,
        data: stored,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to store component: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Load a component from the database by name
   */
  async loadComponent(name: string): Promise<DesignSystemComponent | null> {
    return await this.dbService.getComponentByName(name, this.designSystemId || undefined);
  }

  /**
   * Generate Storybook entry for a component
   */
  async generateStorybookEntry(componentId: number): Promise<SyncResult> {
    try {
      const component = await this.dbService.getComponent(componentId);
      if (!component) {
        return {
          success: false,
          message: `Component with id ${componentId} not found`,
        };
      }

      const storyPath = `Design System/${this.capitalizeCategory(component.category || 'Components')}/${component.display_name || component.name}`;
      
      const entry = await this.dbService.createStorybookEntry({
        design_system_id: this.designSystemId || undefined,
        component_id: componentId,
        story_name: 'Default',
        story_path: storyPath,
        story_kind: 'autodocs',
        story_config: {
          title: storyPath,
          component: component.name,
          parameters: {
            layout: 'centered',
            docs: {
              description: {
                component: component.description,
              },
            },
          },
        },
        args_config: component.default_props || {},
        tags: ['autodocs'],
      });

      return {
        success: true,
        message: `Storybook entry created for '${component.name}'`,
        data: entry,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to generate Storybook entry: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Import existing frontend components to database
   */
  async importFrontendComponents(components: Array<{
    name: string;
    displayName?: string;
    description?: string;
    category?: string;
    code: string;
    props?: Record<string, any>;
    css?: string;
  }>): Promise<SyncResult> {
    if (!this.designSystemId) {
      await this.syncDesignTokensToDatabase();
    }

    const results: DesignSystemComponent[] = [];
    const errors: string[] = [];

    for (const comp of components) {
      try {
        const stored = await this.dbService.createComponent({
          design_system_id: this.designSystemId!,
          name: comp.name,
          display_name: comp.displayName || comp.name,
          description: comp.description,
          category: (comp.category as any) || 'atoms',
          component_code: comp.code,
          props_schema: comp.props || {},
          css_styles: comp.css,
          status: 'published',
        });
        results.push(stored);
      } catch (err: any) {
        errors.push(`Failed to import ${comp.name}: ${err.message}`);
      }
    }

    return {
      success: results.length > 0,
      message: `Imported ${results.length} components`,
      data: { count: results.length, components: results },
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Create dark and light themes
   */
  async createDefaultThemes(): Promise<SyncResult> {
    if (!this.designSystemId) {
      return {
        success: false,
        message: 'Design system not initialized',
      };
    }

    try {
      // Dark theme
      await this.dbService.createTheme({
        design_system_id: this.designSystemId,
        name: 'Dark',
        description: 'Default dark theme with Exodus-inspired colors',
        theme_type: 'dark',
        color_tokens: {
          background: 'hsl(222.2 84% 4.9%)',
          foreground: 'hsl(210 40% 98%)',
          primary: 'hsl(237 92% 64%)',
          primaryForeground: 'hsl(210 40% 98%)',
          secondary: 'hsl(217.2 32.6% 17.5%)',
          secondaryForeground: 'hsl(210 40% 98%)',
          muted: 'hsl(217.2 32.6% 17.5%)',
          mutedForeground: 'hsl(215 20.2% 65.1%)',
          accent: 'hsl(237 92% 64%)',
          accentForeground: 'hsl(210 40% 98%)',
          destructive: 'hsl(0 62.8% 30.6%)',
          destructiveForeground: 'hsl(210 40% 98%)',
          border: 'hsl(217.2 32.6% 17.5%)',
          ring: 'hsl(237 92% 64%)',
        },
        typography_tokens: designTokens.typography,
        spacing_tokens: designTokens.spacing,
        elevation_tokens: designTokens.elevation,
      });

      // Light theme
      await this.dbService.createTheme({
        design_system_id: this.designSystemId,
        name: 'Light',
        description: 'Light theme for better readability in bright environments',
        theme_type: 'light',
        color_tokens: {
          background: 'hsl(0 0% 100%)',
          foreground: 'hsl(222.2 84% 4.9%)',
          primary: 'hsl(237 92% 64%)',
          primaryForeground: 'hsl(210 40% 98%)',
          secondary: 'hsl(210 40% 96.1%)',
          secondaryForeground: 'hsl(222.2 47.4% 11.2%)',
          muted: 'hsl(210 40% 96.1%)',
          mutedForeground: 'hsl(215.4 16.3% 46.9%)',
          accent: 'hsl(237 92% 64%)',
          accentForeground: 'hsl(210 40% 98%)',
          destructive: 'hsl(0 84.2% 60.2%)',
          destructiveForeground: 'hsl(210 40% 98%)',
          border: 'hsl(214.3 31.8% 91.4%)',
          ring: 'hsl(237 92% 64%)',
        },
        typography_tokens: designTokens.typography,
        spacing_tokens: designTokens.spacing,
        elevation_tokens: designTokens.elevation,
      });

      return {
        success: true,
        message: 'Created dark and light themes',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to create themes: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Full sync - design tokens, styleguide, and themes
   */
  async fullSync(designSystemName: string = 'LightDom Default'): Promise<SyncResult> {
    const results: SyncResult[] = [];

    // Sync design tokens
    const tokensResult = await this.syncDesignTokensToDatabase(designSystemName);
    results.push(tokensResult);
    if (!tokensResult.success) {
      return tokensResult;
    }

    // Sync styleguide rules
    const rulesResult = await this.syncStyleguideRulesToDatabase();
    results.push(rulesResult);

    // Create default themes
    const themesResult = await this.createDefaultThemes();
    results.push(themesResult);

    const allErrors = results.flatMap(r => r.errors || []);

    return {
      success: results.every(r => r.success),
      message: `Full sync completed. Design System ID: ${this.designSystemId}`,
      data: {
        designSystemId: this.designSystemId,
        results: results.map(r => ({ message: r.message, success: r.success })),
      },
      errors: allErrors.length > 0 ? allErrors : undefined,
    };
  }

  /**
   * Export design system for backup or transfer
   */
  async exportDesignSystem(): Promise<SyncResult> {
    if (!this.designSystemId) {
      return {
        success: false,
        message: 'Design system not initialized',
      };
    }

    try {
      const exported = await this.dbService.exportDesignSystem(this.designSystemId);
      return {
        success: true,
        message: 'Design system exported successfully',
        data: exported,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to export: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Get the current design system ID
   */
  getDesignSystemId(): number | null {
    return this.designSystemId;
  }

  /**
   * Set the design system ID
   */
  setDesignSystemId(id: number): void {
    this.designSystemId = id;
  }

  private capitalizeCategory(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.dbService.close();
  }
}

// Singleton instance
let syncServiceInstance: DesignSystemSyncService | null = null;

/**
 * Get Design System Sync Service instance
 */
export function getDesignSystemSyncService(): DesignSystemSyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new DesignSystemSyncService();
  }
  return syncServiceInstance;
}

export default DesignSystemSyncService;
