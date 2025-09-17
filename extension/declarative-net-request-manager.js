/**
 * LightDom Declarative Net Request Manager
 * Manages resource blocking and optimization rules for better DOM performance
 */

class LightDomDeclarativeNetRequestManager {
  constructor() {
    this.rules = new Map();
    this.ruleCategories = {
      AD_BLOCKING: 'ad_blocking',
      TRACKING_BLOCKING: 'tracking_blocking',
      RESOURCE_OPTIMIZATION: 'resource_optimization',
      CACHE_OPTIMIZATION: 'cache_optimization',
      CUSTOM_RULES: 'custom_rules',
    };

    this.rulePriorities = {
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    this.init();
  }

  async init() {
    // Load existing rules
    await this.loadRules();

    // Initialize default optimization rules
    await this.initializeDefaultRules();

    // Listen for rule updates
    this.setupRuleListeners();

    console.log('Declarative Net Request Manager initialized');
  }

  async loadRules() {
    try {
      // Load static rules from manifest
      const staticRules = await chrome.declarativeNetRequest.getStaticRules();

      // Load dynamic rules
      const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();

      // Combine and organize rules
      const allRules = [...staticRules, ...dynamicRules];

      allRules.forEach(rule => {
        this.rules.set(rule.id, {
          ...rule,
          category: this.categorizeRule(rule),
          isActive: true,
        });
      });

      console.log(`Loaded ${allRules.length} declarative net request rules`);
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  }

  async initializeDefaultRules() {
    const defaultRules = [
      // Ad blocking rules
      {
        id: 1001,
        priority: this.rulePriorities.HIGH,
        action: { type: 'block' },
        condition: {
          urlFilter: '||ads.*',
          resourceTypes: ['script', 'stylesheet', 'image'],
        },
        category: this.ruleCategories.AD_BLOCKING,
      },
      {
        id: 1002,
        priority: this.rulePriorities.HIGH,
        action: { type: 'block' },
        condition: {
          urlFilter: '||banner.*',
          resourceTypes: ['image', 'script'],
        },
        category: this.ruleCategories.AD_BLOCKING,
      },

      // Tracking blocking rules
      {
        id: 2001,
        priority: this.rulePriorities.HIGH,
        action: { type: 'block' },
        condition: {
          urlFilter: '||analytics.*',
          resourceTypes: ['script', 'xmlhttprequest'],
        },
        category: this.ruleCategories.TRACKING_BLOCKING,
      },
      {
        id: 2002,
        priority: this.rulePriorities.HIGH,
        action: { type: 'block' },
        condition: {
          urlFilter: '||tracking.*',
          resourceTypes: ['script', 'xmlhttprequest'],
        },
        category: this.ruleCategories.TRACKING_BLOCKING,
      },

      // Resource optimization rules
      {
        id: 3001,
        priority: this.rulePriorities.MEDIUM,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'Accept-Encoding',
              operation: 'set',
              value: 'gzip, deflate, br',
            },
          ],
        },
        condition: {
          urlFilter: '*',
          resourceTypes: ['main_frame', 'sub_frame'],
        },
        category: this.ruleCategories.RESOURCE_OPTIMIZATION,
      },

      // Cache optimization rules
      {
        id: 4001,
        priority: this.rulePriorities.LOW,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            {
              header: 'Cache-Control',
              operation: 'set',
              value: 'max-age=3600',
            },
          ],
        },
        condition: {
          urlFilter: '*.css',
          resourceTypes: ['stylesheet'],
        },
        category: this.ruleCategories.CACHE_OPTIMIZATION,
      },
      {
        id: 4002,
        priority: this.rulePriorities.LOW,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            {
              header: 'Cache-Control',
              operation: 'set',
              value: 'max-age=86400',
            },
          ],
        },
        condition: {
          urlFilter: '*.js',
          resourceTypes: ['script'],
        },
        category: this.ruleCategories.CACHE_OPTIMIZATION,
      },
    ];

    // Add default rules if they don't exist
    for (const rule of defaultRules) {
      if (!this.rules.has(rule.id)) {
        await this.addRule(rule);
      }
    }
  }

  setupRuleListeners() {
    // Listen for messages from other parts of the extension
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true;
    });
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'ADD_DECLARATIVE_RULE':
        const addResult = await this.addRule(message.rule);
        sendResponse({ success: addResult.success, ruleId: addResult.ruleId });
        break;

      case 'REMOVE_DECLARATIVE_RULE':
        const removeResult = await this.removeRule(message.ruleId);
        sendResponse({ success: removeResult });
        break;

      case 'UPDATE_DECLARATIVE_RULE':
        const updateResult = await this.updateRule(message.ruleId, message.rule);
        sendResponse({ success: updateResult });
        break;

      case 'GET_DECLARATIVE_RULES':
        const rules = await this.getRules(message.category);
        sendResponse({ success: true, rules });
        break;

      case 'ENABLE_DECLARATIVE_RULE':
        const enableResult = await this.enableRule(message.ruleId);
        sendResponse({ success: enableResult });
        break;

      case 'DISABLE_DECLARATIVE_RULE':
        const disableResult = await this.disableRule(message.ruleId);
        sendResponse({ success: disableResult });
        break;

      case 'BULK_UPDATE_RULES':
        const bulkResult = await this.bulkUpdateRules(message.operations);
        sendResponse({ success: bulkResult.success, results: bulkResult.results });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  async addRule(rule) {
    try {
      // Generate unique ID if not provided
      if (!rule.id) {
        rule.id = this.generateRuleId();
      }

      // Validate rule
      const validation = await this.validateRule(rule);
      if (!validation.isValid) {
        throw new Error(`Invalid rule: ${validation.errors.join(', ')}`);
      }

      // Add to dynamic rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: rule.id,
            priority: rule.priority || this.rulePriorities.MEDIUM,
            action: rule.action,
            condition: rule.condition,
          },
        ],
      });

      // Store in local map
      this.rules.set(rule.id, {
        ...rule,
        isActive: true,
        addedAt: Date.now(),
      });

      console.log(`Added declarative rule ${rule.id}: ${rule.category || 'custom'}`);

      return { success: true, ruleId: rule.id };
    } catch (error) {
      console.error('Failed to add rule:', error);
      return { success: false, error: error.message };
    }
  }

  async removeRule(ruleId) {
    try {
      // Remove from dynamic rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleId],
      });

      // Remove from local map
      this.rules.delete(ruleId);

      console.log(`Removed declarative rule ${ruleId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove rule:', error);
      return false;
    }
  }

  async updateRule(ruleId, updatedRule) {
    try {
      const existingRule = this.rules.get(ruleId);
      if (!existingRule) {
        throw new Error('Rule not found');
      }

      // Remove old rule
      await this.removeRule(ruleId);

      // Add updated rule
      const result = await this.addRule({
        ...updatedRule,
        id: ruleId,
      });

      return result.success;
    } catch (error) {
      console.error('Failed to update rule:', error);
      return false;
    }
  }

  async enableRule(ruleId) {
    try {
      const rule = this.rules.get(ruleId);
      if (!rule) {
        throw new Error('Rule not found');
      }

      if (rule.isActive) {
        return true; // Already enabled
      }

      // Re-add rule to enable it
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: rule.id,
            priority: rule.priority,
            action: rule.action,
            condition: rule.condition,
          },
        ],
      });

      rule.isActive = true;
      rule.enabledAt = Date.now();

      console.log(`Enabled declarative rule ${ruleId}`);
      return true;
    } catch (error) {
      console.error('Failed to enable rule:', error);
      return false;
    }
  }

  async disableRule(ruleId) {
    try {
      const rule = this.rules.get(ruleId);
      if (!rule) {
        throw new Error('Rule not found');
      }

      if (!rule.isActive) {
        return true; // Already disabled
      }

      // Remove rule to disable it
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleId],
      });

      rule.isActive = false;
      rule.disabledAt = Date.now();

      console.log(`Disabled declarative rule ${ruleId}`);
      return true;
    } catch (error) {
      console.error('Failed to disable rule:', error);
      return false;
    }
  }

  async bulkUpdateRules(operations) {
    const results = [];

    for (const operation of operations) {
      try {
        let result;
        switch (operation.type) {
          case 'add':
            result = await this.addRule(operation.rule);
            break;
          case 'remove':
            result = { success: await this.removeRule(operation.ruleId) };
            break;
          case 'update':
            result = { success: await this.updateRule(operation.ruleId, operation.rule) };
            break;
          case 'enable':
            result = { success: await this.enableRule(operation.ruleId) };
            break;
          case 'disable':
            result = { success: await this.disableRule(operation.ruleId) };
            break;
          default:
            result = { success: false, error: 'Unknown operation type' };
        }

        results.push({
          operation: operation.type,
          ruleId: operation.ruleId || operation.rule?.id,
          success: result.success,
          error: result.error,
        });
      } catch (error) {
        results.push({
          operation: operation.type,
          ruleId: operation.ruleId || operation.rule?.id,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      success: results.every(r => r.success),
      results,
    };
  }

  async getRules(category = null) {
    if (category) {
      return Array.from(this.rules.values()).filter(rule => rule.category === category);
    }
    return Array.from(this.rules.values());
  }

  async validateRule(rule) {
    const errors = [];

    // Check required fields
    if (!rule.action) {
      errors.push('Action is required');
    }
    if (!rule.condition) {
      errors.push('Condition is required');
    }

    // Validate action
    if (rule.action) {
      if (!rule.action.type) {
        errors.push('Action type is required');
      }

      const validActionTypes = ['block', 'allow', 'redirect', 'modifyHeaders'];
      if (!validActionTypes.includes(rule.action.type)) {
        errors.push(`Invalid action type: ${rule.action.type}`);
      }
    }

    // Validate condition
    if (rule.condition) {
      if (!rule.condition.urlFilter && !rule.condition.regexFilter) {
        errors.push('URL filter or regex filter is required');
      }

      if (rule.condition.resourceTypes) {
        const validResourceTypes = [
          'main_frame',
          'sub_frame',
          'stylesheet',
          'script',
          'image',
          'font',
          'object',
          'xmlhttprequest',
          'ping',
          'csp_report',
          'media',
          'websocket',
          'webtransport',
          'webbundle',
        ];

        const invalidTypes = rule.condition.resourceTypes.filter(
          type => !validResourceTypes.includes(type)
        );

        if (invalidTypes.length > 0) {
          errors.push(`Invalid resource types: ${invalidTypes.join(', ')}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  categorizeRule(rule) {
    const condition = rule.condition;

    // Ad blocking
    if (
      condition.urlFilter &&
      (condition.urlFilter.includes('ads') ||
        condition.urlFilter.includes('banner') ||
        condition.urlFilter.includes('popup'))
    ) {
      return this.ruleCategories.AD_BLOCKING;
    }

    // Tracking blocking
    if (
      condition.urlFilter &&
      (condition.urlFilter.includes('analytics') ||
        condition.urlFilter.includes('tracking') ||
        condition.urlFilter.includes('metrics'))
    ) {
      return this.ruleCategories.TRACKING_BLOCKING;
    }

    // Cache optimization
    if (
      rule.action.type === 'modifyHeaders' &&
      rule.action.responseHeaders?.some(h => h.header === 'Cache-Control')
    ) {
      return this.ruleCategories.CACHE_OPTIMIZATION;
    }

    // Resource optimization
    if (
      rule.action.type === 'modifyHeaders' &&
      (rule.action.requestHeaders || rule.action.responseHeaders)
    ) {
      return this.ruleCategories.RESOURCE_OPTIMIZATION;
    }

    return this.ruleCategories.CUSTOM_RULES;
  }

  generateRuleId() {
    // Generate a unique rule ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return timestamp * 10000 + random;
  }

  // Rule management for specific optimization scenarios
  async addDOMOptimizationRule(urlPattern, resourceTypes = ['script', 'stylesheet']) {
    const rule = {
      priority: this.rulePriorities.HIGH,
      action: { type: 'block' },
      condition: {
        urlFilter: urlPattern,
        resourceTypes,
      },
      category: this.ruleCategories.RESOURCE_OPTIMIZATION,
    };

    return await this.addRule(rule);
  }

  async addPerformanceOptimizationRule(domain, optimizations) {
    const rules = [];

    if (optimizations.blockAds) {
      rules.push({
        priority: this.rulePriorities.HIGH,
        action: { type: 'block' },
        condition: {
          urlFilter: `||${domain}/ads/*`,
          resourceTypes: ['script', 'stylesheet', 'image'],
        },
        category: this.ruleCategories.AD_BLOCKING,
      });
    }

    if (optimizations.blockTracking) {
      rules.push({
        priority: this.rulePriorities.HIGH,
        action: { type: 'block' },
        condition: {
          urlFilter: `||${domain}/analytics/*`,
          resourceTypes: ['script', 'xmlhttprequest'],
        },
        category: this.ruleCategories.TRACKING_BLOCKING,
      });
    }

    if (optimizations.optimizeCache) {
      rules.push({
        priority: this.rulePriorities.LOW,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            {
              header: 'Cache-Control',
              operation: 'set',
              value: 'max-age=86400',
            },
          ],
        },
        condition: {
          urlFilter: `||${domain}/*`,
          resourceTypes: ['stylesheet', 'script'],
        },
        category: this.ruleCategories.CACHE_OPTIMIZATION,
      });
    }

    const results = [];
    for (const rule of rules) {
      const result = await this.addRule(rule);
      results.push(result);
    }

    return results;
  }

  async getRuleStatistics() {
    const rules = Array.from(this.rules.values());

    return {
      total: rules.length,
      active: rules.filter(r => r.isActive).length,
      inactive: rules.filter(r => !r.isActive).length,
      byCategory: {
        [this.ruleCategories.AD_BLOCKING]: rules.filter(
          r => r.category === this.ruleCategories.AD_BLOCKING
        ).length,
        [this.ruleCategories.TRACKING_BLOCKING]: rules.filter(
          r => r.category === this.ruleCategories.TRACKING_BLOCKING
        ).length,
        [this.ruleCategories.RESOURCE_OPTIMIZATION]: rules.filter(
          r => r.category === this.ruleCategories.RESOURCE_OPTIMIZATION
        ).length,
        [this.ruleCategories.CACHE_OPTIMIZATION]: rules.filter(
          r => r.category === this.ruleCategories.CACHE_OPTIMIZATION
        ).length,
        [this.ruleCategories.CUSTOM_RULES]: rules.filter(
          r => r.category === this.ruleCategories.CUSTOM_RULES
        ).length,
      },
    };
  }
}

// Create global instance
window.lightDomDeclarativeNetRequest = new LightDomDeclarativeNetRequestManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LightDomDeclarativeNetRequestManager;
}
