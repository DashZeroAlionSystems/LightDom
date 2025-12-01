/**
 * Workflow Wizard Routes
 * 
 * API endpoints for workflow wizard configuration and execution
 */

import express from 'express';
import WorkflowWizardService from '../services/workflow-wizard-service.js';
import APIEndpointRegistry from '../services/api-endpoint-registry.js';
import ServiceCompositionOrchestrator from '../services/service-composition-orchestrator.js';

const router = express.Router();

/**
 * Initialize services
 */
function initializeServices(db) {
  const wizardService = new WorkflowWizardService(db);
  const registry = new APIEndpointRegistry(db);
  const orchestrator = new ServiceCompositionOrchestrator(registry);
  
  return { wizardService, registry, orchestrator };
}

/**
 * POST /api/workflow-wizard/configs
 * Create a new wizard configuration
 */
router.post('/configs', async (req, res) => {
  try {
    const { wizardService } = initializeServices(req.app.locals.db);
    const config = await wizardService.createWizardConfig(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Wizard configuration created successfully',
      config
    });
  } catch (error) {
    console.error('Error creating wizard config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create wizard configuration',
      message: error.message
    });
  }
});

/**
 * GET /api/workflow-wizard/configs
 * Get all wizard configurations
 */
router.get('/configs', async (req, res) => {
  try {
    const { wizardService } = initializeServices(req.app.locals.db);
    
    const filters = {
      category: req.query.category,
      wizard_type: req.query.wizard_type,
      is_active: req.query.is_active === 'true' ? true :
                  req.query.is_active === 'false' ? false : undefined
    };
    
    const configs = await wizardService.getAllWizardConfigs(filters);
    
    res.json({
      success: true,
      count: configs.length,
      configs
    });
  } catch (error) {
    console.error('Error getting wizard configs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wizard configurations',
      message: error.message
    });
  }
});

/**
 * GET /api/workflow-wizard/configs/:configId
 * Get wizard configuration by ID
 */
router.get('/configs/:configId', async (req, res) => {
  try {
    const { wizardService } = initializeServices(req.app.locals.db);
    const config = await wizardService.getWizardConfig(req.params.configId);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Wizard configuration not found'
      });
    }
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error getting wizard config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wizard configuration',
      message: error.message
    });
  }
});

/**
 * PUT /api/workflow-wizard/configs/:configId
 * Update wizard configuration
 */
router.put('/configs/:configId', async (req, res) => {
  try {
    const { wizardService } = initializeServices(req.app.locals.db);
    const config = await wizardService.updateWizardConfig(req.params.configId, req.body);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Wizard configuration not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Wizard configuration updated successfully',
      config
    });
  } catch (error) {
    console.error('Error updating wizard config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update wizard configuration',
      message: error.message
    });
  }
});

/**
 * DELETE /api/workflow-wizard/configs/:configId
 * Delete wizard configuration
 */
router.delete('/configs/:configId', async (req, res) => {
  try {
    const { wizardService } = initializeServices(req.app.locals.db);
    const config = await wizardService.deleteWizardConfig(req.params.configId);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Wizard configuration not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Wizard configuration deleted successfully',
      config
    });
  } catch (error) {
    console.error('Error deleting wizard config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete wizard configuration',
      message: error.message
    });
  }
});

/**
 * POST /api/workflow-wizard/generate-from-category
 * Auto-generate wizard from endpoint category
 */
router.post('/generate-from-category', async (req, res) => {
  try {
    const { wizardService, registry } = initializeServices(req.app.locals.db);
    const { category } = req.body;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }
    
    const config = await wizardService.generateWizardFromCategory(category, registry);
    
    res.status(201).json({
      success: true,
      message: 'Wizard configuration generated successfully',
      config
    });
  } catch (error) {
    console.error('Error generating wizard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate wizard configuration',
      message: error.message
    });
  }
});

/**
 * POST /api/workflow-wizard/configs/:configId/submit
 * Process wizard submission to create workflow
 */
router.post('/configs/:configId/submit', async (req, res) => {
  try {
    const { wizardService, registry, orchestrator } = initializeServices(req.app.locals.db);
    const { configId } = req.params;
    const formData = req.body;
    
    const result = await wizardService.processWizardSubmission(
      configId,
      formData,
      registry,
      orchestrator
    );
    
    res.status(201).json({
      success: true,
      message: 'Workflow created successfully from wizard',
      result
    });
  } catch (error) {
    console.error('Error processing wizard submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process wizard submission',
      message: error.message
    });
  }
});

/**
 * GET /api/workflow-wizard/templates
 * Get pre-configured wizard templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'data-pipeline',
        name: 'Data Pipeline Wizard',
        description: 'Create data processing pipelines',
        category: 'data-mining',
        wizard_type: 'data-pipeline',
        icon: '⛏️'
      },
      {
        id: 'api-composition',
        name: 'API Composition Wizard',
        description: 'Combine multiple APIs into a single service',
        category: 'api',
        wizard_type: 'service-composition',
        icon: '🔌'
      },
      {
        id: 'workflow-automation',
        name: 'Workflow Automation Wizard',
        description: 'Automate complex workflows',
        category: 'workflow',
        wizard_type: 'endpoint-chain',
        icon: '🔄'
      },
      {
        id: 'ai-pipeline',
        name: 'AI Pipeline Wizard',
        description: 'Build AI processing pipelines',
        category: 'ai',
        wizard_type: 'service-composition',
        icon: '🤖'
      }
    ];
    
    res.json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get templates',
      message: error.message
    });
  }
});

/**
 * POST /api/workflow-wizard/validate
 * Validate wizard form data
 */
router.post('/validate', async (req, res) => {
  try {
    const { wizardService } = initializeServices(req.app.locals.db);
    const { config_id, form_data, step_id } = req.body;
    
    if (!config_id || !form_data) {
      return res.status(400).json({
        success: false,
        error: 'config_id and form_data are required'
      });
    }
    
    const config = await wizardService.getWizardConfig(config_id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Wizard configuration not found'
      });
    }
    
    // Basic validation - in production, use a JSON Schema validator
    const errors = [];
    const warnings = [];
    
    // Validate required fields
    if (config.required_fields) {
      config.required_fields.forEach(field => {
        if (!form_data[field]) {
          errors.push({
            field,
            message: `${field} is required`
          });
        }
      });
    }
    
    // Check field dependencies
    if (config.field_dependencies) {
      Object.entries(config.field_dependencies).forEach(([field, deps]) => {
        if (form_data[field]) {
          deps.forEach(dep => {
            if (!form_data[dep]) {
              warnings.push({
                field: dep,
                message: `${dep} is recommended when ${field} is set`
              });
            }
          });
        }
      });
    }
    
    res.json({
      success: true,
      valid: errors.length === 0,
      errors,
      warnings
    });
  } catch (error) {
    console.error('Error validating form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate form',
      message: error.message
    });
  }
});

/**
 * GET /api/workflow-wizard/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  res.json({
    success: true,
    service: 'Workflow Wizard',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
