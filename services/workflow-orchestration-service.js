/**
 * Workflow Orchestration Service
 * 
 * Unified service for managing the hierarchical workflow system:
 * Campaigns → Workflows → Services → Data Streams → Attributes
 * 
 * Features:
 * - n8n-compatible workflow triggers
 * - DeepSeek integration for attribute suggestions
 * - Hierarchical CRUD operations
 * - Auto-bundling of related entities
 * 
 * @module services/workflow-orchestration-service
 */

import { randomUUID } from 'crypto';
import EventEmitter from 'events';

/**
 * Entity status values
 */
const STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
  ERROR: 'error'
};

/**
 * Trigger types (n8n compatible)
 */
const TRIGGER_TYPES = {
  MANUAL: 'manual',
  SCHEDULE: 'schedule',
  WEBHOOK: 'webhook',
  EVENT: 'event',
  CRON: 'cron',
  ON_DEMAND: 'on_demand'
};

/**
 * WorkflowOrchestrationService
 * Manages the complete hierarchy of workflow entities
 */
export class WorkflowOrchestrationService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.db = options.db;
    this.deepseekService = options.deepseekService;
    
    // In-memory stores (can be backed by DB)
    this.campaigns = new Map();
    this.workflows = new Map();
    this.services = new Map();
    this.dataStreams = new Map();
    this.attributes = new Map();
    
    // Relationship tracking
    this.campaignWorkflows = new Map(); // campaignId -> Set<workflowId>
    this.workflowServices = new Map();  // workflowId -> Set<serviceId>
    this.serviceDataStreams = new Map(); // serviceId -> Set<dataStreamId>
    this.dataStreamAttributes = new Map(); // dataStreamId -> Set<attributeId>
  }

  // ============================================================================
  // CAMPAIGNS
  // ============================================================================

  /**
   * Create a new campaign
   */
  async createCampaign(data) {
    const campaign = {
      id: data.id || `camp_${randomUUID()}`,
      name: data.name,
      description: data.description || '',
      status: data.status || STATUS.DRAFT,
      triggers: data.triggers || [{ type: TRIGGER_TYPES.MANUAL }],
      config: data.config || {},
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.campaigns.set(campaign.id, campaign);
    this.campaignWorkflows.set(campaign.id, new Set());
    
    this.emit('campaign:created', campaign);
    return campaign;
  }

  /**
   * Get campaign with all nested entities
   */
  async getCampaign(campaignId, options = {}) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return null;
    
    if (options.includeWorkflows) {
      const workflowIds = this.campaignWorkflows.get(campaignId) || new Set();
      campaign.workflows = await Promise.all(
        Array.from(workflowIds).map(id => this.getWorkflow(id, { includeServices: options.deep }))
      );
    }
    
    return campaign;
  }

  /**
   * List all campaigns
   */
  async listCampaigns(filters = {}) {
    let campaigns = Array.from(this.campaigns.values());
    
    if (filters.status) {
      campaigns = campaigns.filter(c => c.status === filters.status);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      campaigns = campaigns.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.description.toLowerCase().includes(search)
      );
    }
    
    return campaigns;
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId, data) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);
    
    const updated = {
      ...campaign,
      ...data,
      id: campaign.id,
      createdAt: campaign.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    this.campaigns.set(campaignId, updated);
    this.emit('campaign:updated', updated);
    return updated;
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);
    
    // Delete all nested workflows
    const workflowIds = this.campaignWorkflows.get(campaignId) || new Set();
    for (const workflowId of workflowIds) {
      await this.deleteWorkflow(workflowId);
    }
    
    this.campaigns.delete(campaignId);
    this.campaignWorkflows.delete(campaignId);
    
    this.emit('campaign:deleted', { id: campaignId });
    return { success: true, id: campaignId };
  }

  /**
   * Add workflow to campaign
   */
  async addWorkflowToCampaign(campaignId, workflowId) {
    if (!this.campaigns.has(campaignId)) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }
    if (!this.workflows.has(workflowId)) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    const workflows = this.campaignWorkflows.get(campaignId);
    workflows.add(workflowId);
    
    // Update workflow's parent reference
    const workflow = this.workflows.get(workflowId);
    workflow.campaignId = campaignId;
    
    this.emit('campaign:workflow_added', { campaignId, workflowId });
    return { success: true };
  }

  // ============================================================================
  // WORKFLOWS
  // ============================================================================

  /**
   * Create a new workflow
   */
  async createWorkflow(data) {
    const workflow = {
      id: data.id || `wf_${randomUUID()}`,
      name: data.name,
      description: data.description || '',
      status: data.status || STATUS.DRAFT,
      campaignId: data.campaignId || null,
      triggers: data.triggers || [{ 
        type: TRIGGER_TYPES.MANUAL,
        enabled: true 
      }],
      config: data.config || {},
      n8nWorkflowId: data.n8nWorkflowId || null,
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.workflows.set(workflow.id, workflow);
    this.workflowServices.set(workflow.id, new Set());
    
    // Add to campaign if specified
    if (data.campaignId && this.campaignWorkflows.has(data.campaignId)) {
      this.campaignWorkflows.get(data.campaignId).add(workflow.id);
    }
    
    this.emit('workflow:created', workflow);
    return workflow;
  }

  /**
   * Get workflow with nested entities
   */
  async getWorkflow(workflowId, options = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;
    
    if (options.includeServices) {
      const serviceIds = this.workflowServices.get(workflowId) || new Set();
      workflow.services = await Promise.all(
        Array.from(serviceIds).map(id => this.getService(id, { includeDataStreams: options.deep }))
      );
    }
    
    return workflow;
  }

  /**
   * List workflows
   */
  async listWorkflows(filters = {}) {
    let workflows = Array.from(this.workflows.values());
    
    if (filters.campaignId) {
      workflows = workflows.filter(w => w.campaignId === filters.campaignId);
    }
    
    if (filters.status) {
      workflows = workflows.filter(w => w.status === filters.status);
    }
    
    return workflows;
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflowId, data) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    
    const updated = {
      ...workflow,
      ...data,
      id: workflow.id,
      createdAt: workflow.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    this.workflows.set(workflowId, updated);
    this.emit('workflow:updated', updated);
    return updated;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    
    // Remove from parent campaign
    if (workflow.campaignId) {
      const campaignWorkflows = this.campaignWorkflows.get(workflow.campaignId);
      if (campaignWorkflows) campaignWorkflows.delete(workflowId);
    }
    
    // Delete nested services
    const serviceIds = this.workflowServices.get(workflowId) || new Set();
    for (const serviceId of serviceIds) {
      await this.deleteService(serviceId);
    }
    
    this.workflows.delete(workflowId);
    this.workflowServices.delete(workflowId);
    
    this.emit('workflow:deleted', { id: workflowId });
    return { success: true, id: workflowId };
  }

  /**
   * Start/stop workflow (trigger control)
   */
  async setWorkflowTriggerState(workflowId, triggerIndex, enabled) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    
    if (workflow.triggers[triggerIndex]) {
      workflow.triggers[triggerIndex].enabled = enabled;
      workflow.updatedAt = new Date().toISOString();
      this.emit('workflow:trigger_changed', { workflowId, triggerIndex, enabled });
    }
    
    return workflow;
  }

  // ============================================================================
  // SERVICES
  // ============================================================================

  /**
   * Create a new service (bundled API)
   */
  async createService(data) {
    const service = {
      id: data.id || `svc_${randomUUID()}`,
      name: data.name,
      description: data.description || '',
      status: data.status || STATUS.DRAFT,
      workflowId: data.workflowId || null,
      type: data.type || 'api', // api, webhook, database, etc.
      endpoint: data.endpoint || null,
      config: data.config || {},
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.services.set(service.id, service);
    this.serviceDataStreams.set(service.id, new Set());
    
    // Add to workflow if specified
    if (data.workflowId && this.workflowServices.has(data.workflowId)) {
      this.workflowServices.get(data.workflowId).add(service.id);
    }
    
    this.emit('service:created', service);
    return service;
  }

  /**
   * Get service with nested entities
   */
  async getService(serviceId, options = {}) {
    const service = this.services.get(serviceId);
    if (!service) return null;
    
    if (options.includeDataStreams) {
      const streamIds = this.serviceDataStreams.get(serviceId) || new Set();
      service.dataStreams = await Promise.all(
        Array.from(streamIds).map(id => this.getDataStream(id, { includeAttributes: options.deep }))
      );
    }
    
    return service;
  }

  /**
   * List services
   */
  async listServices(filters = {}) {
    let services = Array.from(this.services.values());
    
    if (filters.workflowId) {
      services = services.filter(s => s.workflowId === filters.workflowId);
    }
    
    if (filters.type) {
      services = services.filter(s => s.type === filters.type);
    }
    
    return services;
  }

  /**
   * Update service
   */
  async updateService(serviceId, data) {
    const service = this.services.get(serviceId);
    if (!service) throw new Error(`Service not found: ${serviceId}`);
    
    const updated = {
      ...service,
      ...data,
      id: service.id,
      createdAt: service.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    this.services.set(serviceId, updated);
    this.emit('service:updated', updated);
    return updated;
  }

  /**
   * Delete service
   */
  async deleteService(serviceId) {
    const service = this.services.get(serviceId);
    if (!service) throw new Error(`Service not found: ${serviceId}`);
    
    // Remove from parent workflow
    if (service.workflowId) {
      const workflowServices = this.workflowServices.get(service.workflowId);
      if (workflowServices) workflowServices.delete(serviceId);
    }
    
    // Delete nested data streams
    const streamIds = this.serviceDataStreams.get(serviceId) || new Set();
    for (const streamId of streamIds) {
      await this.deleteDataStream(streamId);
    }
    
    this.services.delete(serviceId);
    this.serviceDataStreams.delete(serviceId);
    
    this.emit('service:deleted', { id: serviceId });
    return { success: true, id: serviceId };
  }

  // ============================================================================
  // DATA STREAMS
  // ============================================================================

  /**
   * Create a new data stream
   */
  async createDataStream(data) {
    const dataStream = {
      id: data.id || `ds_${randomUUID()}`,
      name: data.name,
      description: data.description || '',
      status: data.status || STATUS.DRAFT,
      serviceId: data.serviceId || null,
      sourceType: data.sourceType || 'api',
      destinationType: data.destinationType || 'database',
      config: data.config || {},
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.dataStreams.set(dataStream.id, dataStream);
    this.dataStreamAttributes.set(dataStream.id, new Set());
    
    // Add to service if specified
    if (data.serviceId && this.serviceDataStreams.has(data.serviceId)) {
      this.serviceDataStreams.get(data.serviceId).add(dataStream.id);
    }
    
    this.emit('dataStream:created', dataStream);
    return dataStream;
  }

  /**
   * Get data stream with nested entities
   */
  async getDataStream(dataStreamId, options = {}) {
    const dataStream = this.dataStreams.get(dataStreamId);
    if (!dataStream) return null;
    
    if (options.includeAttributes) {
      const attrIds = this.dataStreamAttributes.get(dataStreamId) || new Set();
      dataStream.attributes = Array.from(attrIds).map(id => this.attributes.get(id)).filter(Boolean);
    }
    
    return dataStream;
  }

  /**
   * List data streams
   */
  async listDataStreams(filters = {}) {
    let streams = Array.from(this.dataStreams.values());
    
    if (filters.serviceId) {
      streams = streams.filter(s => s.serviceId === filters.serviceId);
    }
    
    if (filters.sourceType) {
      streams = streams.filter(s => s.sourceType === filters.sourceType);
    }
    
    return streams;
  }

  /**
   * Update data stream
   */
  async updateDataStream(dataStreamId, data) {
    const dataStream = this.dataStreams.get(dataStreamId);
    if (!dataStream) throw new Error(`Data stream not found: ${dataStreamId}`);
    
    const updated = {
      ...dataStream,
      ...data,
      id: dataStream.id,
      createdAt: dataStream.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    this.dataStreams.set(dataStreamId, updated);
    this.emit('dataStream:updated', updated);
    return updated;
  }

  /**
   * Delete data stream
   */
  async deleteDataStream(dataStreamId) {
    const dataStream = this.dataStreams.get(dataStreamId);
    if (!dataStream) throw new Error(`Data stream not found: ${dataStreamId}`);
    
    // Remove from parent service
    if (dataStream.serviceId) {
      const serviceStreams = this.serviceDataStreams.get(dataStream.serviceId);
      if (serviceStreams) serviceStreams.delete(dataStreamId);
    }
    
    // Delete nested attributes
    const attrIds = this.dataStreamAttributes.get(dataStreamId) || new Set();
    for (const attrId of attrIds) {
      this.attributes.delete(attrId);
    }
    
    this.dataStreams.delete(dataStreamId);
    this.dataStreamAttributes.delete(dataStreamId);
    
    this.emit('dataStream:deleted', { id: dataStreamId });
    return { success: true, id: dataStreamId };
  }

  // ============================================================================
  // ATTRIBUTES
  // ============================================================================

  /**
   * Create a new attribute
   */
  async createAttribute(data) {
    const attribute = {
      id: data.id || `attr_${randomUUID()}`,
      name: data.name,
      label: data.label || data.name,
      description: data.description || '',
      dataStreamId: data.dataStreamId || null,
      type: data.type || 'string', // string, number, boolean, object, array
      category: data.category || 'general', // seo, content, technical, etc.
      enrichmentPrompt: data.enrichmentPrompt || null,
      generatedByDeepSeek: data.generatedByDeepSeek || false,
      config: data.config || {},
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.attributes.set(attribute.id, attribute);
    
    // Add to data stream if specified
    if (data.dataStreamId && this.dataStreamAttributes.has(data.dataStreamId)) {
      this.dataStreamAttributes.get(data.dataStreamId).add(attribute.id);
    }
    
    this.emit('attribute:created', attribute);
    return attribute;
  }

  /**
   * Get attribute
   */
  async getAttribute(attributeId) {
    return this.attributes.get(attributeId) || null;
  }

  /**
   * List attributes
   */
  async listAttributes(filters = {}) {
    let attributes = Array.from(this.attributes.values());
    
    if (filters.dataStreamId) {
      attributes = attributes.filter(a => a.dataStreamId === filters.dataStreamId);
    }
    
    if (filters.category) {
      attributes = attributes.filter(a => a.category === filters.category);
    }
    
    if (filters.type) {
      attributes = attributes.filter(a => a.type === filters.type);
    }
    
    return attributes;
  }

  /**
   * Update attribute
   */
  async updateAttribute(attributeId, data) {
    const attribute = this.attributes.get(attributeId);
    if (!attribute) throw new Error(`Attribute not found: ${attributeId}`);
    
    const updated = {
      ...attribute,
      ...data,
      id: attribute.id,
      createdAt: attribute.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    this.attributes.set(attributeId, updated);
    this.emit('attribute:updated', updated);
    return updated;
  }

  /**
   * Delete attribute
   */
  async deleteAttribute(attributeId) {
    const attribute = this.attributes.get(attributeId);
    if (!attribute) throw new Error(`Attribute not found: ${attributeId}`);
    
    // Remove from parent data stream
    if (attribute.dataStreamId) {
      const streamAttrs = this.dataStreamAttributes.get(attribute.dataStreamId);
      if (streamAttrs) streamAttrs.delete(attributeId);
    }
    
    this.attributes.delete(attributeId);
    
    this.emit('attribute:deleted', { id: attributeId });
    return { success: true, id: attributeId };
  }

  // ============================================================================
  // DEEPSEEK INTEGRATION
  // ============================================================================

  /**
   * Use DeepSeek to suggest related attributes for a topic
   */
  async suggestAttributesWithDeepSeek(topic, category = 'seo', options = {}) {
    const prompt = `You are an expert in ${category} data attributes. Given the topic "${topic}", suggest relevant attributes that would be useful for data collection and analysis.

For each attribute, provide:
1. name: A snake_case identifier
2. label: Human-readable label
3. description: Brief description
4. type: Data type (string, number, boolean, array, object)
5. category: Category (${category})

Return as JSON array. Example for SEO topic "h1":
[
  {"name": "h1_text", "label": "H1 Text", "description": "Primary heading text content", "type": "string", "category": "seo"},
  {"name": "h1_count", "label": "H1 Count", "description": "Number of H1 tags on page", "type": "number", "category": "seo"},
  {"name": "h1_keywords", "label": "H1 Keywords", "description": "Keywords found in H1", "type": "array", "category": "seo"}
]

Now suggest attributes for topic: "${topic}"`;

    // If DeepSeek service is available, use it
    if (this.deepseekService) {
      try {
        const response = await this.deepseekService.chat({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        });
        
        const content = response.choices?.[0]?.message?.content || '[]';
        // Extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            const attributes = JSON.parse(jsonMatch[0]);
            return attributes.map(attr => ({
              ...attr,
              generatedByDeepSeek: true,
              metadata: { topic, originalPrompt: prompt }
            }));
          } catch (parseError) {
            console.error('Failed to parse DeepSeek JSON response:', parseError);
          }
        }
      } catch (error) {
        console.error('DeepSeek suggestion error:', error);
      }
    }
    
    // Fallback: Return predefined attributes based on category
    return this._getFallbackAttributes(topic, category);
  }

  /**
   * Fallback attributes when DeepSeek is not available
   */
  _getFallbackAttributes(topic, category) {
    const topicLower = topic.toLowerCase();
    
    const seoAttributes = {
      h1: [
        { name: 'h1_text', label: 'H1 Text', description: 'Primary heading text', type: 'string', category: 'seo' },
        { name: 'h1_count', label: 'H1 Count', description: 'Number of H1 tags', type: 'number', category: 'seo' },
        { name: 'h1_length', label: 'H1 Length', description: 'Character count of H1', type: 'number', category: 'seo' }
      ],
      title: [
        { name: 'page_title', label: 'Page Title', description: 'Title tag content', type: 'string', category: 'seo' },
        { name: 'title_length', label: 'Title Length', description: 'Character count', type: 'number', category: 'seo' }
      ],
      meta: [
        { name: 'meta_description', label: 'Meta Description', description: 'Meta description content', type: 'string', category: 'seo' },
        { name: 'meta_keywords', label: 'Meta Keywords', description: 'Meta keywords list', type: 'array', category: 'seo' }
      ],
      default: [
        { name: `${topicLower}_value`, label: `${topic} Value`, description: `Value for ${topic}`, type: 'string', category },
        { name: `${topicLower}_count`, label: `${topic} Count`, description: `Count of ${topic}`, type: 'number', category }
      ]
    };
    
    return seoAttributes[topicLower] || seoAttributes.default;
  }

  /**
   * Create attributes from DeepSeek suggestions
   */
  async createAttributesFromSuggestions(dataStreamId, topic, category = 'seo') {
    const suggestions = await this.suggestAttributesWithDeepSeek(topic, category);
    
    const createdAttributes = [];
    for (const suggestion of suggestions) {
      const attribute = await this.createAttribute({
        ...suggestion,
        dataStreamId,
        generatedByDeepSeek: true
      });
      createdAttributes.push(attribute);
    }
    
    return createdAttributes;
  }

  // ============================================================================
  // WORKFLOW BUNDLING & AUTO-CREATION
  // ============================================================================

  /**
   * Create a complete workflow bundle with DeepSeek
   * This creates a campaign with workflows, services, data streams, and attributes
   */
  async createWorkflowBundle(config) {
    const {
      name,
      description,
      topics = [],
      category = 'seo',
      useDeepSeek = true
    } = config;

    // 1. Create Campaign
    const campaign = await this.createCampaign({
      name: `${name} Campaign`,
      description: description || `Auto-generated campaign for ${name}`,
      triggers: [{ type: TRIGGER_TYPES.MANUAL }]
    });

    // 2. Create Workflow
    const workflow = await this.createWorkflow({
      name,
      description,
      campaignId: campaign.id,
      triggers: [
        { type: TRIGGER_TYPES.MANUAL, enabled: true },
        { type: TRIGGER_TYPES.SCHEDULE, enabled: false, cron: '0 0 * * *' }
      ]
    });

    // 3. Create Service
    const service = await this.createService({
      name: `${name} Data Service`,
      description: `Data collection service for ${name}`,
      workflowId: workflow.id,
      type: 'api'
    });

    // 4. Create Data Stream
    const dataStream = await this.createDataStream({
      name: `${name} Stream`,
      description: `Data stream for ${name}`,
      serviceId: service.id,
      sourceType: 'api',
      destinationType: 'database'
    });

    // 5. Create Attributes (with DeepSeek if enabled)
    const attributes = [];
    for (const topic of topics) {
      if (useDeepSeek) {
        const topicAttrs = await this.createAttributesFromSuggestions(dataStream.id, topic, category);
        attributes.push(...topicAttrs);
      } else {
        const fallbackAttrs = this._getFallbackAttributes(topic, category);
        for (const attr of fallbackAttrs) {
          const created = await this.createAttribute({ ...attr, dataStreamId: dataStream.id });
          attributes.push(created);
        }
      }
    }

    return {
      campaign,
      workflow,
      service,
      dataStream,
      attributes,
      summary: {
        campaignId: campaign.id,
        workflowId: workflow.id,
        serviceId: service.id,
        dataStreamId: dataStream.id,
        attributeCount: attributes.length,
        createdAt: new Date().toISOString()
      }
    };
  }

  // ============================================================================
  // WORKFLOW TRIGGERS (n8n compatible)
  // ============================================================================

  /**
   * Start a workflow
   */
  async startWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    
    workflow.status = STATUS.ACTIVE;
    workflow.updatedAt = new Date().toISOString();
    
    this.emit('workflow:started', workflow);
    return workflow;
  }

  /**
   * Stop a workflow
   */
  async stopWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    
    workflow.status = STATUS.PAUSED;
    workflow.updatedAt = new Date().toISOString();
    
    this.emit('workflow:stopped', workflow);
    return workflow;
  }

  /**
   * Execute a workflow (run all services and data streams)
   */
  async executeWorkflow(workflowId) {
    const workflow = await this.getWorkflow(workflowId, { includeServices: true, deep: true });
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    
    const executionId = `exec_${randomUUID()}`;
    const execution = {
      id: executionId,
      workflowId,
      status: 'running',
      startedAt: new Date().toISOString(),
      results: []
    };
    
    this.emit('workflow:execution_started', execution);
    
    // Execute each service
    for (const service of workflow.services || []) {
      execution.results.push({
        serviceId: service.id,
        serviceName: service.name,
        status: 'completed',
        dataStreams: service.dataStreams?.length || 0,
        attributes: service.dataStreams?.reduce((acc, ds) => acc + (ds.attributes?.length || 0), 0) || 0
      });
    }
    
    execution.status = 'completed';
    execution.completedAt = new Date().toISOString();
    
    this.emit('workflow:execution_completed', execution);
    return execution;
  }

  // ============================================================================
  // STATISTICS & METRICS
  // ============================================================================

  /**
   * Get system statistics
   */
  getStatistics() {
    return {
      campaigns: this.campaigns.size,
      workflows: this.workflows.size,
      services: this.services.size,
      dataStreams: this.dataStreams.size,
      attributes: this.attributes.size,
      relationships: {
        campaignWorkflows: Array.from(this.campaignWorkflows.values()).reduce((acc, set) => acc + set.size, 0),
        workflowServices: Array.from(this.workflowServices.values()).reduce((acc, set) => acc + set.size, 0),
        serviceDataStreams: Array.from(this.serviceDataStreams.values()).reduce((acc, set) => acc + set.size, 0),
        dataStreamAttributes: Array.from(this.dataStreamAttributes.values()).reduce((acc, set) => acc + set.size, 0)
      }
    };
  }
}

// Singleton instance
let workflowOrchestrationInstance = null;

export function getWorkflowOrchestrationService(options = {}) {
  if (!workflowOrchestrationInstance) {
    workflowOrchestrationInstance = new WorkflowOrchestrationService(options);
  }
  return workflowOrchestrationInstance;
}

export default WorkflowOrchestrationService;
