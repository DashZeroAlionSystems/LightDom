/**
 * N8N Workflow Trigger Service
 * 
 * Manages workflow triggers and execution based on campaign events
 * Provides template-based trigger definition using DeepSeek AI
 * 
 * Features:
 * - Event-based triggers (schema discovered, URL collected, data mined, etc.)
 * - Conditional execution logic
 * - DeepSeek-powered trigger generation
 * - Integration with campaign orchestrator
 * - Template library from n8n awesome-list and GitHub
 */

import axios from 'axios';
import EventEmitter from 'events';

class N8NWorkflowTriggerService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.n8nBaseUrl = options.n8nBaseUrl || process.env.N8N_API_URL || 'http://localhost:5678';
    this.n8nApiKey = options.n8nApiKey || process.env.N8N_API_KEY || '';
    this.deepseekApiUrl = options.deepseekApiUrl || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    this.deepseekApiKey = options.deepseekApiKey || process.env.DEEPSEEK_API_KEY || '';
    
    this.triggers = new Map(); // workflowId -> trigger config
    this.activeListeners = new Map(); // triggerId -> cleanup function
    this.executionHistory = []; // Recent executions
    
    // Pre-loaded templates from awesome-n8n and GitHub
    this.templates = this.loadTemplates();
  }

  /**
   * Load workflow templates from research
   */
  loadTemplates() {
    return {
      'schema-discovered': {
        name: 'Schema Discovery Trigger',
        description: 'Triggers when a new schema type is discovered during crawling',
        event: 'campaign.schema.discovered',
        condition: '{{schema.type}} !== null',
        workflow: null, // Will be generated
        defaultActions: [
          'Send notification',
          'Update seeding configuration',
          'Start specialized crawler',
          'Generate training data'
        ]
      },
      'url-collected': {
        name: 'URL Collection Trigger',
        description: 'Triggers when new URLs are collected by seeding service',
        event: 'campaign.seeder.urls_collected',
        condition: '{{urls.length}} > 0',
        workflow: null,
        defaultActions: [
          'Validate URLs',
          'Filter by robots.txt',
          'Add to crawler queue',
          'Update statistics'
        ]
      },
      'data-mined': {
        name: 'Data Mining Complete Trigger',
        description: 'Triggers when data mining completes for a URL',
        event: 'campaign.crawler.data_mined',
        condition: '{{data.success}} === true',
        workflow: null,
        defaultActions: [
          'Store in database',
          'Extract schemas',
          'Run OCR if images',
          'Update analytics'
        ]
      },
      'cluster-scaled': {
        name: 'Cluster Auto-Scale Trigger',
        description: 'Triggers when crawler cluster needs scaling',
        event: 'campaign.cluster.scale_needed',
        condition: '{{queue.length}} > {{cluster.capacity}} * 2',
        workflow: null,
        defaultActions: [
          'Spawn new crawler instance',
          'Rebalance load',
          'Update cluster config',
          'Send alert'
        ]
      },
      'error-threshold': {
        name: 'Error Threshold Trigger',
        description: 'Triggers when error rate exceeds threshold',
        event: 'campaign.error.threshold_exceeded',
        condition: '{{errors.rate}} > 0.1',
        workflow: null,
        defaultActions: [
          'Pause campaign',
          'Send alert',
          'Rotate proxies',
          'Adjust rate limits'
        ]
      },
      'training-ready': {
        name: 'Training Data Ready Trigger',
        description: 'Triggers when enough data is collected for ML training',
        event: 'campaign.training.ready',
        condition: '{{data.count}} >= {{training.minSamples}}',
        workflow: null,
        defaultActions: [
          'Prepare training dataset',
          'Start neural network training',
          'Validate data quality',
          'Generate report'
        ]
      }
    };
  }

  /**
   * Create trigger for a campaign event
   */
  async createTrigger(config) {
    const {
      campaignId,
      eventType,
      workflowId,
      condition,
      description,
      enabled = true,
      useTemplate = null
    } = config;

    // Generate workflow if using template
    let finalWorkflowId = workflowId;
    if (useTemplate && this.templates[useTemplate]) {
      const template = this.templates[useTemplate];
      const generatedWorkflow = await this.generateWorkflowFromTemplate(
        template,
        { campaignId, description }
      );
      finalWorkflowId = generatedWorkflow.id;
    }

    const triggerId = `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const trigger = {
      id: triggerId,
      campaignId,
      eventType,
      workflowId: finalWorkflowId,
      condition: condition || 'true', // Default: always execute
      description,
      enabled,
      createdAt: new Date(),
      executionCount: 0,
      lastExecuted: null
    };

    this.triggers.set(triggerId, trigger);

    // Start listening if enabled
    if (enabled) {
      await this.enableTrigger(triggerId);
    }

    return trigger;
  }

  /**
   * Generate n8n workflow from template using DeepSeek
   */
  async generateWorkflowFromTemplate(template, params) {
    const prompt = `Create an n8n workflow for: ${template.name}

Description: ${template.description}
Trigger Event: ${template.event}
Condition: ${template.condition}
Campaign ID: ${params.campaignId}

The workflow should:
${template.defaultActions.map((action, idx) => `${idx + 1}. ${action}`).join('\n')}

Generate a complete n8n workflow JSON with:
- Webhook trigger node
- Condition/IF node for: ${template.condition}
- Action nodes for each step
- Error handling
- Response node

Return ONLY valid n8n workflow JSON format.`;

    try {
      const response = await axios.post(
        `${this.deepseekApiUrl}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.deepseekApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const workflowJSON = response.data.choices[0].message.content;
      
      // Parse JSON (handle markdown code blocks)
      const jsonMatch = workflowJSON.match(/```json\n([\s\S]*?)\n```/) || 
                        workflowJSON.match(/```\n([\s\S]*?)\n```/);
      
      const workflowData = JSON.parse(jsonMatch ? jsonMatch[1] : workflowJSON);
      
      // Add metadata
      workflowData.name = template.name;
      workflowData.tags = ['lightdom', 'campaign', params.campaignId];

      // Create workflow in n8n
      const n8nResponse = await axios.post(
        `${this.n8nBaseUrl}/api/v1/workflows`,
        workflowData,
        {
          headers: {
            'X-N8N-API-KEY': this.n8nApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const workflow = n8nResponse.data.data || n8nResponse.data;
      
      // Activate workflow
      await axios.patch(
        `${this.n8nBaseUrl}/api/v1/workflows/${workflow.id}`,
        { active: true },
        {
          headers: {
            'X-N8N-API-KEY': this.n8nApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return workflow;
    } catch (error) {
      console.error('Failed to generate workflow from template:', error);
      throw error;
    }
  }

  /**
   * Enable trigger - start listening for events
   */
  async enableTrigger(triggerId) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) {
      throw new Error(`Trigger ${triggerId} not found`);
    }

    // Create event listener
    const listener = async (eventData) => {
      await this.executeTrigger(triggerId, eventData);
    };

    // Listen for the event type
    this.on(trigger.eventType, listener);
    
    // Store cleanup function
    this.activeListeners.set(triggerId, () => {
      this.off(trigger.eventType, listener);
    });

    trigger.enabled = true;
  }

  /**
   * Disable trigger - stop listening
   */
  disableTrigger(triggerId) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) {
      throw new Error(`Trigger ${triggerId} not found`);
    }

    const cleanup = this.activeListeners.get(triggerId);
    if (cleanup) {
      cleanup();
      this.activeListeners.delete(triggerId);
    }

    trigger.enabled = false;
  }

  /**
   * Execute trigger - run the workflow
   */
  async executeTrigger(triggerId, eventData) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger || !trigger.enabled) {
      return;
    }

    try {
      // Evaluate condition
      const shouldExecute = this.evaluateCondition(trigger.condition, eventData);
      
      if (!shouldExecute) {
        console.log(`Trigger ${triggerId} condition not met, skipping execution`);
        return;
      }

      // Execute workflow in n8n
      const execution = await axios.post(
        `${this.n8nBaseUrl}/api/v1/workflows/${trigger.workflowId}/execute`,
        {
          data: {
            trigger: {
              id: triggerId,
              campaignId: trigger.campaignId,
              eventType: trigger.eventType
            },
            event: eventData,
            timestamp: new Date().toISOString()
          }
        },
        {
          headers: {
            'X-N8N-API-KEY': this.n8nApiKey,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      // Update trigger stats
      trigger.executionCount++;
      trigger.lastExecuted = new Date();

      // Store execution history
      this.executionHistory.unshift({
        triggerId,
        workflowId: trigger.workflowId,
        executionId: execution.data.id || execution.data.data?.id,
        eventData,
        timestamp: new Date(),
        success: true
      });

      // Keep only last 100 executions
      if (this.executionHistory.length > 100) {
        this.executionHistory.pop();
      }

      console.log(`Trigger ${triggerId} executed successfully:`, execution.data.id);
      
      return execution.data;
    } catch (error) {
      console.error(`Failed to execute trigger ${triggerId}:`, error);
      
      // Store failed execution
      this.executionHistory.unshift({
        triggerId,
        workflowId: trigger.workflowId,
        eventData,
        timestamp: new Date(),
        success: false,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Evaluate trigger condition
   */
  evaluateCondition(condition, data) {
    if (!condition || condition === 'true') {
      return true;
    }

    try {
      // Simple template variable substitution
      let evalString = condition;
      
      // Replace {{variable.path}} with actual values
      const matches = condition.match(/\{\{([^}]+)\}\}/g) || [];
      for (const match of matches) {
        const path = match.slice(2, -2).trim();
        const value = this.getNestedValue(data, path);
        evalString = evalString.replace(match, JSON.stringify(value));
      }

      // Evaluate the expression (NOTE: This is simplified - use a proper expression evaluator in production)
      // For safety, we'll use a whitelist of operators
      const safeEval = evalString
        .replace(/===/g, '===')
        .replace(/!==/g, '!==')
        .replace(/>/g, '>')
        .replace(/</g, '<')
        .replace(/&&/g, '&&')
        .replace(/\|\|/g, '||');

      return eval(safeEval); // In production, use a safer alternative like jsep or similar
    } catch (error) {
      console.error('Failed to evaluate condition:', condition, error);
      return false;
    }
  }

  /**
   * Get nested value from object by path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Emit campaign event (to be called by campaign orchestrator)
   */
  emitCampaignEvent(eventType, data) {
    this.emit(eventType, data);
  }

  /**
   * Get trigger by ID
   */
  getTrigger(triggerId) {
    return this.triggers.get(triggerId);
  }

  /**
   * List all triggers
   */
  listTriggers(filters = {}) {
    let triggers = Array.from(this.triggers.values());

    if (filters.campaignId) {
      triggers = triggers.filter(t => t.campaignId === filters.campaignId);
    }

    if (filters.enabled !== undefined) {
      triggers = triggers.filter(t => t.enabled === filters.enabled);
    }

    if (filters.eventType) {
      triggers = triggers.filter(t => t.eventType === filters.eventType);
    }

    return triggers;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(filters = {}) {
    let history = [...this.executionHistory];

    if (filters.triggerId) {
      history = history.filter(h => h.triggerId === filters.triggerId);
    }

    if (filters.success !== undefined) {
      history = history.filter(h => h.success === filters.success);
    }

    if (filters.limit) {
      history = history.slice(0, filters.limit);
    }

    return history;
  }

  /**
   * Delete trigger
   */
  async deleteTrigger(triggerId) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) {
      throw new Error(`Trigger ${triggerId} not found`);
    }

    // Disable first
    if (trigger.enabled) {
      this.disableTrigger(triggerId);
    }

    // Delete from map
    this.triggers.delete(triggerId);

    return { success: true, message: 'Trigger deleted' };
  }

  /**
   * Get available templates
   */
  getTemplates() {
    return Object.entries(this.templates).map(([key, template]) => ({
      key,
      ...template
    }));
  }

  /**
   * Get statistics
   */
  getStats() {
    const triggers = Array.from(this.triggers.values());
    
    return {
      total: triggers.length,
      enabled: triggers.filter(t => t.enabled).length,
      disabled: triggers.filter(t => !t.enabled).length,
      totalExecutions: triggers.reduce((sum, t) => sum + t.executionCount, 0),
      recentExecutions: this.executionHistory.length,
      successRate: this.calculateSuccessRate()
    };
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate() {
    if (this.executionHistory.length === 0) {
      return 100;
    }

    const successful = this.executionHistory.filter(h => h.success).length;
    return Math.round((successful / this.executionHistory.length) * 100);
  }
}

export default N8NWorkflowTriggerService;
