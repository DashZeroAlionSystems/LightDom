/**
 * Design System API Routes
 * 
 * Provides REST API endpoints for:
 * - Design system configuration
 * - Styleguide rules
 * - Component library (store/load React components)
 * - Storybook entries
 * - Themes
 * 
 * All endpoints are prefixed with /api/design-system
 */

import express from 'express';
import {
  DesignSystemDatabaseService,
  getDesignSystemDatabaseService,
} from '../src/database/DesignSystemDatabaseService.js';
import {
  DesignSystemSyncService,
  getDesignSystemSyncService,
} from '../src/database/DesignSystemSyncService.js';

const router = express.Router();

// Initialize services
let dbService: DesignSystemDatabaseService;
let syncService: DesignSystemSyncService;

const initServices = async () => {
  if (!dbService) {
    dbService = getDesignSystemDatabaseService();
    await dbService.initialize();
  }
  if (!syncService) {
    syncService = getDesignSystemSyncService();
    await syncService.initialize();
  }
};

// Middleware to ensure services are initialized
router.use(async (req, res, next) => {
  try {
    await initServices();
    next();
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to initialize design system services', details: error.message });
  }
});

// ============================================================================
// Design System Config Endpoints
// ============================================================================

/**
 * GET /api/design-system/config
 * List all design system configurations
 */
router.get('/config', async (req, res) => {
  try {
    const configs = await dbService.listDesignSystemConfigs();
    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/design-system/config/active
 * Get the active design system configuration
 */
router.get('/config/active', async (req, res) => {
  try {
    const config = await dbService.getActiveDesignSystemConfig();
    if (!config) {
      return res.status(404).json({ success: false, error: 'No active design system found' });
    }
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/design-system/config/:id
 * Get design system configuration by ID
 */
router.get('/config/:id', async (req, res) => {
  try {
    const config = await dbService.getDesignSystemConfig(parseInt(req.params.id));
    if (!config) {
      return res.status(404).json({ success: false, error: 'Design system not found' });
    }
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/design-system/config
 * Create a new design system configuration
 */
router.post('/config', async (req, res) => {
  try {
    const { name, version, tokens, theme_config } = req.body;
    if (!name || !tokens) {
      return res.status(400).json({ success: false, error: 'Name and tokens are required' });
    }
    const config = await dbService.createDesignSystemConfig({
      name,
      version: version || '1.0.0',
      tokens,
      theme_config: theme_config || {},
    });
    res.status(201).json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/design-system/config/:id
 * Update a design system configuration
 */
router.put('/config/:id', async (req, res) => {
  try {
    const updated = await dbService.updateDesignSystemConfig(parseInt(req.params.id), req.body);
    res.json({ success: true, data: updated[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// Styleguide Rules Endpoints
// ============================================================================

/**
 * GET /api/design-system/styleguide/:designSystemId
 * Get all styleguide rules for a design system
 */
router.get('/styleguide/:designSystemId', async (req, res) => {
  try {
    const rules = await dbService.getStyleguideRules(parseInt(req.params.designSystemId));
    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/design-system/styleguide/:designSystemId/:category
 * Get styleguide rules by category
 */
router.get('/styleguide/:designSystemId/:category', async (req, res) => {
  try {
    const rules = await dbService.getStyleguideRulesByCategory(
      parseInt(req.params.designSystemId),
      req.params.category
    );
    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/design-system/styleguide
 * Create a new styleguide rule
 */
router.post('/styleguide', async (req, res) => {
  try {
    const rule = await dbService.createStyleguideRule(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/design-system/styleguide/:id
 * Update a styleguide rule
 */
router.put('/styleguide/:id', async (req, res) => {
  try {
    const updated = await dbService.updateStyleguideRule(parseInt(req.params.id), req.body);
    res.json({ success: true, data: updated[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/design-system/styleguide/:id
 * Delete a styleguide rule
 */
router.delete('/styleguide/:id', async (req, res) => {
  try {
    await dbService.deleteStyleguideRule(parseInt(req.params.id));
    res.json({ success: true, message: 'Rule deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// Component Endpoints
// ============================================================================

/**
 * GET /api/design-system/components
 * List all components
 */
router.get('/components', async (req, res) => {
  try {
    const { designSystemId, category, status, search } = req.query;
    
    let components;
    if (search) {
      components = await dbService.searchComponents(
        search as string,
        designSystemId ? parseInt(designSystemId as string) : undefined
      );
    } else if (category) {
      components = await dbService.getComponentsByCategory(
        category as string,
        designSystemId ? parseInt(designSystemId as string) : undefined
      );
    } else if (status === 'published') {
      components = await dbService.getPublishedComponents(
        designSystemId ? parseInt(designSystemId as string) : undefined
      );
    } else {
      components = await dbService.listAllComponents(
        designSystemId ? parseInt(designSystemId as string) : undefined
      );
    }
    
    res.json({ success: true, data: components, count: components.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/design-system/components/:id
 * Get component by ID
 */
router.get('/components/:id', async (req, res) => {
  try {
    const component = await dbService.getComponent(parseInt(req.params.id));
    if (!component) {
      return res.status(404).json({ success: false, error: 'Component not found' });
    }
    res.json({ success: true, data: component });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/design-system/components/name/:name
 * Get component by name
 */
router.get('/components/name/:name', async (req, res) => {
  try {
    const { designSystemId } = req.query;
    const component = await dbService.getComponentByName(
      req.params.name,
      designSystemId ? parseInt(designSystemId as string) : undefined
    );
    if (!component) {
      return res.status(404).json({ success: false, error: 'Component not found' });
    }
    res.json({ success: true, data: component });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/design-system/components
 * Create a new component
 */
router.post('/components', async (req, res) => {
  try {
    const { name, component_code } = req.body;
    if (!name || !component_code) {
      return res.status(400).json({ success: false, error: 'Name and component_code are required' });
    }
    const component = await dbService.createComponent(req.body);
    res.status(201).json({ success: true, data: component });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/design-system/components/:id
 * Update a component
 */
router.put('/components/:id', async (req, res) => {
  try {
    const updated = await dbService.updateComponent(parseInt(req.params.id), req.body);
    res.json({ success: true, data: updated[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/design-system/components/:id
 * Delete a component
 */
router.delete('/components/:id', async (req, res) => {
  try {
    await dbService.deleteComponent(parseInt(req.params.id));
    res.json({ success: true, message: 'Component deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/design-system/components/bulk
 * Bulk import components
 */
router.post('/components/bulk', async (req, res) => {
  try {
    const { components } = req.body;
    if (!Array.isArray(components)) {
      return res.status(400).json({ success: false, error: 'Components array is required' });
    }
    const imported = await dbService.bulkImportComponents(components);
    res.status(201).json({ success: true, data: imported, count: imported.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/design-system/components/:id/code
 * Get just the component code (for dynamic loading)
 */
router.get('/components/:id/code', async (req, res) => {
  try {
    const component = await dbService.getComponent(parseInt(req.params.id));
    if (!component) {
      return res.status(404).json({ success: false, error: 'Component not found' });
    }
    res.json({
      success: true,
      data: {
        name: component.name,
        code: component.component_code,
        css: component.css_styles,
        props: component.props_schema,
        defaults: component.default_props,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// Storybook Entries Endpoints
// ============================================================================

/**
 * GET /api/design-system/storybook
 * List all Storybook entries
 */
router.get('/storybook', async (req, res) => {
  try {
    const { designSystemId } = req.query;
    const entries = await dbService.getStorybookEntries(
      designSystemId ? parseInt(designSystemId as string) : undefined
    );
    res.json({ success: true, data: entries });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/design-system/storybook/component/:componentId
 * Get Storybook entries for a component
 */
router.get('/storybook/component/:componentId', async (req, res) => {
  try {
    const entries = await dbService.getStorybookEntriesByComponent(parseInt(req.params.componentId));
    res.json({ success: true, data: entries });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/design-system/storybook
 * Create a Storybook entry
 */
router.post('/storybook', async (req, res) => {
  try {
    const entry = await dbService.createStorybookEntry(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/design-system/storybook/generate/:componentId
 * Auto-generate Storybook entry for a component
 */
router.post('/storybook/generate/:componentId', async (req, res) => {
  try {
    const result = await syncService.generateStorybookEntry(parseInt(req.params.componentId));
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/design-system/storybook/:id
 * Update a Storybook entry
 */
router.put('/storybook/:id', async (req, res) => {
  try {
    const updated = await dbService.updateStorybookEntry(parseInt(req.params.id), req.body);
    res.json({ success: true, data: updated[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/design-system/storybook/:id
 * Delete a Storybook entry
 */
router.delete('/storybook/:id', async (req, res) => {
  try {
    await dbService.deleteStorybookEntry(parseInt(req.params.id));
    res.json({ success: true, message: 'Storybook entry deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// Theme Endpoints
// ============================================================================

/**
 * GET /api/design-system/themes/:designSystemId
 * Get all themes for a design system
 */
router.get('/themes/:designSystemId', async (req, res) => {
  try {
    const themes = await dbService.getThemes(parseInt(req.params.designSystemId));
    res.json({ success: true, data: themes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/design-system/themes
 * Create a new theme
 */
router.post('/themes', async (req, res) => {
  try {
    const theme = await dbService.createTheme(req.body);
    res.status(201).json({ success: true, data: theme });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// Sync Endpoints
// ============================================================================

/**
 * POST /api/design-system/sync
 * Sync frontend design system to database
 */
router.post('/sync', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await syncService.fullSync(name || 'LightDom Default');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/design-system/sync/tokens
 * Sync only design tokens
 */
router.post('/sync/tokens', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await syncService.syncDesignTokensToDatabase(name || 'LightDom Default');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/design-system/sync/styleguide
 * Sync styleguide rules
 */
router.post('/sync/styleguide', async (req, res) => {
  try {
    const result = await syncService.syncStyleguideRulesToDatabase();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/design-system/export/:designSystemId
 * Export entire design system
 */
router.get('/export/:designSystemId', async (req, res) => {
  try {
    syncService.setDesignSystemId(parseInt(req.params.designSystemId));
    const result = await syncService.exportDesignSystem();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// Component Variants Endpoints
// ============================================================================

/**
 * GET /api/design-system/variants/:componentId
 * Get all variants for a component
 */
router.get('/variants/:componentId', async (req, res) => {
  try {
    const variants = await dbService.getComponentVariants(parseInt(req.params.componentId));
    res.json({ success: true, data: variants });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/design-system/variants
 * Create a component variant
 */
router.post('/variants', async (req, res) => {
  try {
    const variant = await dbService.createComponentVariant(req.body);
    res.status(201).json({ success: true, data: variant });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
