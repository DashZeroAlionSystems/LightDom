/**
 * Command Service API Routes
 * 
 * REST API endpoints for managing /commands with CRUD functionality.
 * 
 * Endpoints:
 * - GET /api/commands - List all commands
 * - GET /api/commands/:id - Get command details
 * - POST /api/commands - Create a new command
 * - PUT /api/commands/:id - Update a command
 * - DELETE /api/commands/:id - Delete a command
 * - POST /api/commands/execute - Execute a command
 * - GET /api/commands/suggestions - Get command suggestions
 * - GET /api/commands/stats - Get command statistics
 */

import { Router } from 'express';
import { CommandService } from '../services/command-service.js';

/**
 * Create command routes
 * @param {Object} config - Configuration with database pool
 * @returns {Router} Express router
 */
export function createCommandRoutes(config = {}) {
  const router = Router();
  
  // Initialize service
  const commandService = new CommandService({
    db: config.db
  });
  
  // Initialize service on first request
  let initialized = false;
  
  const ensureInitialized = async (req, res, next) => {
    if (!initialized) {
      try {
        await commandService.initialize();
        initialized = true;
      } catch (error) {
        console.error('Failed to initialize command service:', error);
        return res.status(500).json({
          success: false,
          error: 'Service initialization failed'
        });
      }
    }
    next();
  };
  
  router.use(ensureInitialized);

  // ==========================================================================
  // COMMAND CRUD
  // ==========================================================================

  /**
   * GET /api/commands
   * List all commands
   */
  router.get('/', async (req, res) => {
    try {
      const { category, enabledOnly, includeBuiltIn } = req.query;
      
      const commands = commandService.listCommands({
        category,
        enabledOnly: enabledOnly !== 'false',
        includeBuiltIn: includeBuiltIn !== 'false'
      });
      
      res.json({
        success: true,
        data: commands,
        total: commands.length
      });
    } catch (error) {
      console.error('Error listing commands:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list commands'
      });
    }
  });

  /**
   * GET /api/commands/categories
   * Get all command categories
   */
  router.get('/categories', async (req, res) => {
    try {
      const categories = commandService.getCategories();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get categories'
      });
    }
  });

  /**
   * GET /api/commands/stats
   * Get command statistics
   */
  router.get('/stats', async (req, res) => {
    try {
      const stats = await commandService.getStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics'
      });
    }
  });

  /**
   * GET /api/commands/suggestions
   * Get command suggestions for partial input
   */
  router.get('/suggestions', async (req, res) => {
    try {
      const { input } = req.query;
      const suggestions = commandService.getSuggestions(input || '');
      
      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Error getting suggestions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get suggestions'
      });
    }
  });

  /**
   * GET /api/commands/:id
   * Get command details
   */
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const command = commandService.getCommand(id);
      
      if (!command) {
        return res.status(404).json({
          success: false,
          error: `Command not found: ${id}`
        });
      }
      
      res.json({
        success: true,
        data: command
      });
    } catch (error) {
      console.error('Error getting command:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get command'
      });
    }
  });

  /**
   * POST /api/commands
   * Create a new command
   */
  router.post('/', async (req, res) => {
    try {
      const { id, name, description, category, handler, config, examples } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Command name is required'
        });
      }
      
      const command = await commandService.createCommand({
        id,
        name,
        description,
        category,
        handler,
        config,
        examples,
        createdBy: req.user?.id
      });
      
      res.status(201).json({
        success: true,
        data: command,
        message: `Command "${command.name}" created`
      });
    } catch (error) {
      console.error('Error creating command:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create command'
      });
    }
  });

  /**
   * PUT /api/commands/:id
   * Update a command
   */
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const command = await commandService.updateCommand(id, updates);
      
      res.json({
        success: true,
        data: command,
        message: `Command "${command.name}" updated`
      });
    } catch (error) {
      console.error('Error updating command:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update command'
      });
    }
  });

  /**
   * DELETE /api/commands/:id
   * Delete a command
   */
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      await commandService.deleteCommand(id);
      
      res.json({
        success: true,
        message: `Command "${id}" deleted`
      });
    } catch (error) {
      console.error('Error deleting command:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to delete command'
      });
    }
  });

  // ==========================================================================
  // COMMAND EXECUTION
  // ==========================================================================

  /**
   * POST /api/commands/execute
   * Execute a command
   */
  router.post('/execute', async (req, res) => {
    try {
      const { input, context } = req.body;
      
      if (!input) {
        return res.status(400).json({
          success: false,
          error: 'Input is required'
        });
      }
      
      const result = await commandService.executeCommand(input, {
        ...context,
        userId: req.user?.id,
        sessionId: req.sessionID
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error executing command:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to execute command'
      });
    }
  });

  /**
   * POST /api/commands/parse
   * Parse a command without executing
   */
  router.post('/parse', async (req, res) => {
    try {
      const { input } = req.body;
      
      if (!input) {
        return res.status(400).json({
          success: false,
          error: 'Input is required'
        });
      }
      
      const parsed = commandService.parseCommand(input);
      
      if (!parsed) {
        return res.json({
          success: false,
          isCommand: false,
          suggestions: commandService.getSuggestions(input)
        });
      }
      
      res.json({
        success: true,
        isCommand: true,
        data: {
          command: parsed.command.name,
          description: parsed.command.description,
          params: parsed.params,
          args: parsed.args
        }
      });
    } catch (error) {
      console.error('Error parsing command:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to parse command'
      });
    }
  });

  /**
   * GET /api/commands/health
   * Health check endpoint
   */
  router.get('/health', async (req, res) => {
    try {
      const stats = await commandService.getStatistics();
      
      res.json({
        success: true,
        status: 'healthy',
        commandsLoaded: stats.totalCommands
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message
      });
    }
  });

  return router;
}

export default createCommandRoutes;
