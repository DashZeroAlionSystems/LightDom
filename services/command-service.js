/**
 * Command Service
 * 
 * CRUD functionality for managing /commands in the system.
 * Commands are configurable actions that can be triggered from prompt inputs.
 * 
 * Features:
 * - Register, update, delete commands
 * - Execute commands with parameters
 * - Command configurations stored in database
 * - Event-driven command execution
 * - Governance via configuration options
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';

class CommandService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.db = options.db || new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
    
    // In-memory command registry for fast lookups
    this.commands = new Map();
    
    // Default built-in commands
    this.builtInCommands = this.initializeBuiltInCommands();
    
    this.initialized = false;
  }

  /**
   * Initialize built-in commands
   */
  initializeBuiltInCommands() {
    return {
      // Storybook mining commands
      'mine': {
        id: 'mine',
        name: '/mine',
        description: 'Mine storybooks for training data',
        category: 'storybook',
        handler: 'storybook-mining',
        config: {
          requiresModel: false,
          defaultParams: { sites: [] }
        },
        examples: [
          '/mine',
          '/mine https://ant.design',
          '/mine --model=universal-sentence-encoder'
        ],
        isBuiltIn: true
      },
      'train': {
        id: 'train',
        name: '/train',
        description: 'Start training with a pretrained model',
        category: 'training',
        handler: 'model-training',
        config: {
          requiresModel: true,
          supportedModels: [
            'universal-sentence-encoder',
            'bert-base-uncased',
            'mobilenet-v2',
            'sentence-transformers-minilm'
          ]
        },
        examples: [
          '/train --model=universal-sentence-encoder',
          '/train --model=bert-base-uncased --epochs=50'
        ],
        isBuiltIn: true
      },
      'models': {
        id: 'models',
        name: '/models',
        description: 'List available pretrained models',
        category: 'info',
        handler: 'list-models',
        config: {},
        examples: ['/models', '/models --filter=image'],
        isBuiltIn: true
      },
      'status': {
        id: 'status',
        name: '/status',
        description: 'Check training or mining status',
        category: 'info',
        handler: 'check-status',
        config: {},
        examples: ['/status', '/status --session=abc123'],
        isBuiltIn: true
      },
      'help': {
        id: 'help',
        name: '/help',
        description: 'Show available commands',
        category: 'info',
        handler: 'show-help',
        config: {},
        examples: ['/help', '/help mine', '/help train'],
        isBuiltIn: true
      },
      'search': {
        id: 'search',
        name: '/search',
        description: 'Search components or patterns',
        category: 'search',
        handler: 'component-search',
        config: {
          maxResults: 20
        },
        examples: ['/search button', '/search modal --type=component'],
        isBuiltIn: true
      },
      'generate': {
        id: 'generate',
        name: '/generate',
        description: 'Generate component or story from description',
        category: 'generation',
        handler: 'component-generator',
        config: {
          outputFormat: 'tsx',
          includeStory: true
        },
        examples: [
          '/generate button with primary variant',
          '/generate card component for product display'
        ],
        isBuiltIn: true
      },
      'workflow': {
        id: 'workflow',
        name: '/workflow',
        description: 'Create or manage workflows',
        category: 'workflow',
        handler: 'workflow-manager',
        config: {},
        examples: [
          '/workflow create data-mining',
          '/workflow list',
          '/workflow run pipeline-1'
        ],
        isBuiltIn: true
      },
      'config': {
        id: 'config',
        name: '/config',
        description: 'View or update configuration',
        category: 'system',
        handler: 'config-manager',
        config: {
          requiresAdmin: true
        },
        examples: [
          '/config show',
          '/config set mining.concurrency=5'
        ],
        isBuiltIn: true
      },
      'clear': {
        id: 'clear',
        name: '/clear',
        description: 'Clear conversation history',
        category: 'utility',
        handler: 'clear-history',
        config: {},
        examples: ['/clear'],
        isBuiltIn: true
      },
      'export': {
        id: 'export',
        name: '/export',
        description: 'Export training data or components',
        category: 'utility',
        handler: 'data-export',
        config: {
          formats: ['json', 'csv', 'tfjs']
        },
        examples: [
          '/export training-data --format=json',
          '/export components --filter=button'
        ],
        isBuiltIn: true
      }
    };
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('🚀 Initializing Command Service...');
    
    try {
      // Ensure database tables exist
      await this.ensureTables();
      
      // Load custom commands from database
      await this.loadCustomCommands();
      
      // Register built-in commands
      for (const [id, cmd] of Object.entries(this.builtInCommands)) {
        this.commands.set(id, cmd);
      }
      
      this.initialized = true;
      this.emit('initialized');
      
      console.log(`✅ Command Service initialized with ${this.commands.size} commands`);
    } catch (error) {
      console.error('❌ Failed to initialize Command Service:', error);
      throw error;
    }
  }

  /**
   * Ensure database tables exist
   */
  async ensureTables() {
    const createTablesSQL = `
      -- Commands registry table
      CREATE TABLE IF NOT EXISTS prompt_commands (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(50) DEFAULT 'custom',
        handler VARCHAR(100),
        config JSONB DEFAULT '{}',
        examples TEXT[] DEFAULT '{}',
        is_enabled BOOLEAN DEFAULT TRUE,
        is_built_in BOOLEAN DEFAULT FALSE,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Command executions log
      CREATE TABLE IF NOT EXISTS command_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        command_id VARCHAR(100) REFERENCES prompt_commands(id) ON DELETE SET NULL,
        command_name VARCHAR(100) NOT NULL,
        parameters JSONB DEFAULT '{}',
        input_text TEXT,
        result JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        error_message TEXT,
        execution_time_ms INTEGER,
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Command configurations (governance)
      CREATE TABLE IF NOT EXISTS command_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        command_id VARCHAR(100) REFERENCES prompt_commands(id) ON DELETE CASCADE,
        config_key VARCHAR(100) NOT NULL,
        config_value JSONB NOT NULL,
        scope VARCHAR(50) DEFAULT 'global',
        scope_id VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(command_id, config_key, scope, scope_id)
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_prompt_commands_category ON prompt_commands(category);
      CREATE INDEX IF NOT EXISTS idx_prompt_commands_enabled ON prompt_commands(is_enabled);
      CREATE INDEX IF NOT EXISTS idx_command_executions_command ON command_executions(command_id);
      CREATE INDEX IF NOT EXISTS idx_command_executions_status ON command_executions(status);
      CREATE INDEX IF NOT EXISTS idx_command_configs_command ON command_configs(command_id);
    `;

    try {
      await this.db.query(createTablesSQL);
      console.log('✅ Command tables ensured');
    } catch (error) {
      console.warn('Warning: Could not create command tables:', error.message);
    }
  }

  /**
   * Load custom commands from database
   */
  async loadCustomCommands() {
    try {
      const result = await this.db.query(`
        SELECT * FROM prompt_commands 
        WHERE is_enabled = TRUE AND is_built_in = FALSE
        ORDER BY name
      `);
      
      for (const row of result.rows) {
        this.commands.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          handler: row.handler,
          config: row.config || {},
          examples: row.examples || [],
          isBuiltIn: false,
          isEnabled: row.is_enabled
        });
      }
      
      console.log(`📦 Loaded ${result.rows.length} custom commands`);
    } catch (error) {
      console.warn('Could not load custom commands:', error.message);
    }
  }

  // ==========================================================================
  // CRUD OPERATIONS
  // ==========================================================================

  /**
   * Create a new command
   */
  async createCommand(commandData) {
    const {
      id,
      name,
      description,
      category = 'custom',
      handler,
      config = {},
      examples = [],
      createdBy
    } = commandData;
    
    // Validate command name format
    const commandName = name.startsWith('/') ? name : `/${name}`;
    const commandId = id || commandName.slice(1).toLowerCase().replace(/\s+/g, '-');
    
    // Check for duplicates
    if (this.commands.has(commandId)) {
      throw new Error(`Command "${commandId}" already exists`);
    }
    
    try {
      const result = await this.db.query(`
        INSERT INTO prompt_commands (id, name, description, category, handler, config, examples, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        commandId,
        commandName,
        description,
        category,
        handler,
        JSON.stringify(config),
        examples,
        createdBy
      ]);
      
      const command = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        category: result.rows[0].category,
        handler: result.rows[0].handler,
        config: result.rows[0].config,
        examples: result.rows[0].examples,
        isBuiltIn: false,
        isEnabled: true
      };
      
      this.commands.set(commandId, command);
      this.emit('command:created', command);
      
      return command;
    } catch (error) {
      throw new Error(`Failed to create command: ${error.message}`);
    }
  }

  /**
   * Get a command by ID or name
   */
  getCommand(idOrName) {
    const id = idOrName.startsWith('/') ? idOrName.slice(1) : idOrName;
    return this.commands.get(id) || null;
  }

  /**
   * List all commands
   */
  listCommands(options = {}) {
    const { category, enabledOnly = true, includeBuiltIn = true } = options;
    
    let commands = Array.from(this.commands.values());
    
    if (category) {
      commands = commands.filter(c => c.category === category);
    }
    
    if (!includeBuiltIn) {
      commands = commands.filter(c => !c.isBuiltIn);
    }
    
    if (enabledOnly) {
      commands = commands.filter(c => c.isEnabled !== false);
    }
    
    return commands.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Update a command
   */
  async updateCommand(id, updates) {
    const command = this.commands.get(id);
    
    if (!command) {
      throw new Error(`Command "${id}" not found`);
    }
    
    if (command.isBuiltIn) {
      throw new Error('Cannot modify built-in commands');
    }
    
    const allowedUpdates = ['description', 'category', 'handler', 'config', 'examples', 'is_enabled'];
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedUpdates.includes(dbKey)) {
        updateFields.push(`${dbKey} = $${paramIndex}`);
        updateValues.push(key === 'config' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }
    
    if (updateFields.length === 0) {
      return command;
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(id);
    
    try {
      const result = await this.db.query(`
        UPDATE prompt_commands
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, updateValues);
      
      const updatedCommand = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        category: result.rows[0].category,
        handler: result.rows[0].handler,
        config: result.rows[0].config,
        examples: result.rows[0].examples,
        isBuiltIn: false,
        isEnabled: result.rows[0].is_enabled
      };
      
      this.commands.set(id, updatedCommand);
      this.emit('command:updated', updatedCommand);
      
      return updatedCommand;
    } catch (error) {
      throw new Error(`Failed to update command: ${error.message}`);
    }
  }

  /**
   * Delete a command
   */
  async deleteCommand(id) {
    const command = this.commands.get(id);
    
    if (!command) {
      throw new Error(`Command "${id}" not found`);
    }
    
    if (command.isBuiltIn) {
      throw new Error('Cannot delete built-in commands');
    }
    
    try {
      await this.db.query('DELETE FROM prompt_commands WHERE id = $1', [id]);
      this.commands.delete(id);
      this.emit('command:deleted', { id });
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete command: ${error.message}`);
    }
  }

  // ==========================================================================
  // COMMAND EXECUTION
  // ==========================================================================

  /**
   * Parse command from input text
   */
  parseCommand(input) {
    if (!input || !input.startsWith('/')) {
      return null;
    }
    
    const parts = input.trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const commandId = commandName.slice(1);
    
    const command = this.commands.get(commandId);
    if (!command) {
      return null;
    }
    
    // Parse parameters
    const params = {};
    const args = [];
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.startsWith('--')) {
        const [key, value] = part.slice(2).split('=');
        params[key] = value || true;
      } else {
        args.push(part);
      }
    }
    
    return {
      command,
      commandName,
      params,
      args,
      rawInput: input
    };
  }

  /**
   * Execute a command
   */
  async executeCommand(input, context = {}) {
    const parsed = this.parseCommand(input);
    
    if (!parsed) {
      return {
        success: false,
        error: 'Unknown command or invalid format',
        suggestions: this.getSuggestions(input)
      };
    }
    
    const { command, params, args, rawInput } = parsed;
    const startTime = Date.now();
    
    // Log execution
    let executionId;
    try {
      const logResult = await this.db.query(`
        INSERT INTO command_executions (command_id, command_name, parameters, input_text, user_id, session_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'running')
        RETURNING id
      `, [
        command.id,
        command.name,
        JSON.stringify({ ...params, args }),
        rawInput,
        context.userId,
        context.sessionId
      ]);
      executionId = logResult.rows[0].id;
    } catch (error) {
      console.warn('Could not log command execution:', error.message);
    }
    
    try {
      // Execute based on handler
      const result = await this.handleCommand(command, params, args, context);
      
      const executionTime = Date.now() - startTime;
      
      // Update execution log
      if (executionId) {
        await this.db.query(`
          UPDATE command_executions
          SET status = 'completed', result = $1, execution_time_ms = $2
          WHERE id = $3
        `, [JSON.stringify(result), executionTime, executionId]);
      }
      
      this.emit('command:executed', {
        command: command.name,
        params,
        result,
        executionTime
      });
      
      return {
        success: true,
        command: command.name,
        result,
        executionTime
      };
      
    } catch (error) {
      // Update execution log with error
      if (executionId) {
        await this.db.query(`
          UPDATE command_executions
          SET status = 'failed', error_message = $1, execution_time_ms = $2
          WHERE id = $3
        `, [error.message, Date.now() - startTime, executionId]);
      }
      
      return {
        success: false,
        command: command.name,
        error: error.message
      };
    }
  }

  /**
   * Handle command execution based on handler type
   */
  async handleCommand(command, params, args, context) {
    switch (command.handler) {
      case 'show-help':
        return this.handleHelp(args[0]);
        
      case 'list-models':
        return this.handleListModels(params);
        
      case 'storybook-mining':
        return this.handleStorybookMining(params, args, context);
        
      case 'model-training':
        return this.handleModelTraining(params, context);
        
      case 'check-status':
        return this.handleCheckStatus(params, context);
        
      case 'clear-history':
        return { message: 'History cleared', action: 'clear' };
        
      default:
        return { 
          message: `Command "${command.name}" executed`,
          handler: command.handler,
          params,
          args
        };
    }
  }

  /**
   * Handle /help command
   */
  handleHelp(specificCommand) {
    if (specificCommand) {
      const command = this.getCommand(specificCommand);
      if (command) {
        return {
          type: 'help-detail',
          command: command.name,
          description: command.description,
          category: command.category,
          examples: command.examples,
          config: command.config
        };
      }
      return {
        type: 'help-not-found',
        message: `Command "${specificCommand}" not found`
      };
    }
    
    // Return all commands grouped by category
    const commands = this.listCommands();
    const grouped = {};
    
    for (const cmd of commands) {
      if (!grouped[cmd.category]) {
        grouped[cmd.category] = [];
      }
      grouped[cmd.category].push({
        name: cmd.name,
        description: cmd.description
      });
    }
    
    return {
      type: 'help-list',
      categories: grouped,
      totalCommands: commands.length
    };
  }

  /**
   * Handle /models command
   */
  handleListModels(params) {
    // List the 11 pretrained models
    const models = [
      { id: 'universal-sentence-encoder', task: 'text-embedding', performance: 'high' },
      { id: 'bert-base-uncased', task: 'text-classification', performance: 'medium' },
      { id: 'distilbert-sst2-sentiment', task: 'sentiment-analysis', performance: 'fast' },
      { id: 'sentence-transformers-minilm', task: 'sentence-embedding', performance: 'very-fast' },
      { id: 'mobilenet-v2', task: 'image-classification', performance: 'very-fast' },
      { id: 'efficientnet-b0', task: 'image-classification', performance: 'medium' },
      { id: 'toxicity-detection', task: 'text-classification', performance: 'fast' },
      { id: 'question-answering-bert', task: 'question-answering', performance: 'medium' },
      { id: 'named-entity-recognition', task: 'token-classification', performance: 'medium' },
      { id: 'zero-shot-classification', task: 'zero-shot-classification', performance: 'slow' },
      { id: 'text-summarization', task: 'summarization', performance: 'slow' }
    ];
    
    let filtered = models;
    if (params.filter) {
      filtered = models.filter(m => 
        m.task.includes(params.filter) || m.id.includes(params.filter)
      );
    }
    
    return {
      type: 'model-list',
      models: filtered,
      total: filtered.length
    };
  }

  /**
   * Handle /mine command
   */
  async handleStorybookMining(params, args, context) {
    return {
      type: 'mining-started',
      message: 'Storybook mining initiated',
      sites: args.length > 0 ? args : ['default sites'],
      model: params.model || 'auto',
      action: 'mine'
    };
  }

  /**
   * Handle /train command
   */
  async handleModelTraining(params, context) {
    if (!params.model) {
      return {
        type: 'training-error',
        error: 'Model is required. Use --model=<model-id>',
        availableModels: this.handleListModels({}).models.map(m => m.id)
      };
    }
    
    return {
      type: 'training-started',
      message: `Training started with model: ${params.model}`,
      model: params.model,
      epochs: params.epochs || 50,
      action: 'train'
    };
  }

  /**
   * Handle /status command
   */
  async handleCheckStatus(params, context) {
    return {
      type: 'status',
      message: 'No active training or mining sessions',
      session: params.session || null
    };
  }

  /**
   * Get command suggestions for partial input
   */
  getSuggestions(input) {
    if (!input || !input.startsWith('/')) {
      return this.listCommands().slice(0, 5).map(c => c.name);
    }
    
    const partial = input.slice(1).toLowerCase();
    return this.listCommands()
      .filter(c => c.name.slice(1).startsWith(partial))
      .slice(0, 5)
      .map(c => c.name);
  }

  /**
   * Get command categories
   */
  getCategories() {
    const categories = new Set();
    for (const cmd of this.commands.values()) {
      categories.add(cmd.category);
    }
    return Array.from(categories);
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const commands = this.listCommands({ enabledOnly: false });
    
    let executionStats = { total: 0, successful: 0, failed: 0 };
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'completed') as successful,
          COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM command_executions
      `);
      executionStats = result.rows[0];
    } catch (error) {
      console.warn('Could not get execution stats:', error.message);
    }
    
    return {
      totalCommands: commands.length,
      builtInCommands: commands.filter(c => c.isBuiltIn).length,
      customCommands: commands.filter(c => !c.isBuiltIn).length,
      categories: this.getCategories(),
      executions: executionStats
    };
  }

  /**
   * Close the service
   */
  async close() {
    this.commands.clear();
    this.emit('closed');
    console.log('✅ Command Service closed');
  }
}

export default CommandService;
export { CommandService };
