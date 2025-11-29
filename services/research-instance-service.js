/**
 * Research Instance Service
 * 
 * Manages deep-dive research campaigns for topic analysis and attribute discovery.
 * Integrates with DeepSeek for AI-powered research and schema linking.
 * 
 * Features:
 * - Kick off research from natural language prompts
 * - Deep-dive wiki and schema linking
 * - Knowledge graph construction
 * - Automatic attribute discovery
 */

import { EventEmitter } from 'events';
import deepSeekService from './deepseek-api-service.js';

class ResearchInstanceService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      defaultDepth: config.defaultDepth || 'deep',
      maxConcurrentResearch: config.maxConcurrentResearch || 3,
      researchTimeout: config.researchTimeout || 300000, // 5 minutes
      ...config
    };

    // In-memory storage (replace with database in production)
    this.researchInstances = new Map();
    this.db = config.db || null;
  }

  /**
   * Kick off a research instance from a topic prompt
   */
  async kickoffResearch(topic, prompt, options = {}) {
    try {
      console.log(`🔬 Initiating research on topic: "${topic}"`);

      const researchId = `research_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      
      const research = {
        research_id: researchId,
        topic,
        prompt,
        status: 'initializing',
        research_depth: options.depth || this.config.defaultDepth,
        discovered_schemas: [],
        wiki_links: [],
        knowledge_graph: {},
        metadata: {
          initiatedFrom: options.initiatedFrom || 'manual',
          priority: options.priority || 5,
          ...options.metadata
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.researchInstances.set(researchId, research);
      
      // Save to database if available
      if (this.db) {
        await this.saveResearchToDB(research);
      }

      this.emit('researchInitiated', research);
      
      // Start research process asynchronously
      this.executeResearch(researchId).catch(error => {
        console.error(`Research ${researchId} failed:`, error);
        this.updateResearchStatus(researchId, 'failed', { error: error.message });
      });

      console.log(`✅ Research initiated: ${researchId}`);
      return research;
    } catch (error) {
      console.error('Failed to kickoff research:', error);
      throw error;
    }
  }

  /**
   * Execute the research process
   */
  async executeResearch(researchId) {
    try {
      const research = this.researchInstances.get(researchId);
      if (!research) {
        throw new Error(`Research instance ${researchId} not found`);
      }

      // Phase 1: Initial Analysis
      await this.updateResearchStatus(researchId, 'researching');
      console.log(`📊 Phase 1: Analyzing topic "${research.topic}"`);
      
      const analysis = await this.analyzeTopicWithAI(research.topic, research.prompt);
      research.metadata.analysis = analysis;

      // Phase 2: Schema Discovery
      console.log(`🔍 Phase 2: Discovering related schemas`);
      const schemas = await this.discoverSchemas(research.topic, analysis);
      research.discovered_schemas = schemas;

      // Phase 3: Wiki Linking
      console.log(`🔗 Phase 3: Building wiki links`);
      const wikiLinks = await this.buildWikiLinks(research.topic, schemas);
      research.wiki_links = wikiLinks;

      // Phase 4: Knowledge Graph Construction
      console.log(`🕸️ Phase 4: Constructing knowledge graph`);
      const knowledgeGraph = await this.buildKnowledgeGraph(research.topic, schemas, wikiLinks);
      research.knowledge_graph = knowledgeGraph;

      // Mark as completed
      await this.updateResearchStatus(researchId, 'completed');
      research.completed_at = new Date().toISOString();
      
      if (this.db) {
        await this.updateResearchInDB(research);
      }

      this.emit('researchCompleted', research);
      console.log(`✅ Research completed: ${researchId}`);
      
      return research;
    } catch (error) {
      console.error(`Research execution failed for ${researchId}:`, error);
      await this.updateResearchStatus(researchId, 'failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze topic using AI
   */
  async analyzeTopicWithAI(topic, prompt) {
    try {
      // Use DeepSeek to analyze the topic
      const analysisPrompt = `Perform a comprehensive analysis of the topic: "${topic}"

Context: ${prompt}

Provide a detailed analysis including:
1. Core concepts and definitions
2. Related categories and subcategories
3. Key attributes and properties
4. Data sources and reference materials
5. Industry standards and schemas
6. Relevant APIs and integrations
7. Common use cases and applications

Format the response as JSON with these sections.`;

      const analysis = await deepSeekService.generateWorkflowFromPrompt(analysisPrompt, {
        temperature: 0.7,
        maxTokens: 3000
      });

      return {
        coreConcepts: analysis.coreConcepts || [],
        categories: analysis.categories || [],
        attributes: analysis.attributes || [],
        dataSources: analysis.dataSources || [],
        schemas: analysis.schemas || [],
        apis: analysis.apis || [],
        useCases: analysis.useCases || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Return fallback analysis
      return {
        coreConcepts: [topic],
        categories: ['general'],
        attributes: [],
        dataSources: [],
        schemas: [],
        apis: [],
        useCases: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Discover related schemas
   */
  async discoverSchemas(topic, analysis) {
    const schemas = [];
    
    // Generate schema.org mappings
    const schemaTypes = this.mapToSchemaOrg(topic, analysis);
    
    for (const schemaType of schemaTypes) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': schemaType.type,
        '@id': `lightdom:research:${topic.toLowerCase().replace(/\s+/g, '-')}:${schemaType.type}`,
        name: schemaType.name,
        description: schemaType.description,
        properties: schemaType.properties || [],
        source: 'schema.org',
        confidence: schemaType.confidence || 0.8
      });
    }

    return schemas;
  }

  /**
   * Map topic to Schema.org types
   */
  mapToSchemaOrg(topic, analysis) {
    const mappings = [];
    const topicLower = topic.toLowerCase();

    // Common schema.org mappings
    const schemaPatterns = {
      'product': { type: 'Product', properties: ['name', 'price', 'description', 'image'] },
      'article': { type: 'Article', properties: ['headline', 'author', 'datePublished', 'articleBody'] },
      'event': { type: 'Event', properties: ['name', 'startDate', 'location', 'organizer'] },
      'person': { type: 'Person', properties: ['name', 'email', 'jobTitle', 'affiliation'] },
      'organization': { type: 'Organization', properties: ['name', 'url', 'logo', 'contactPoint'] },
      'place': { type: 'Place', properties: ['name', 'address', 'geo', 'telephone'] },
      'recipe': { type: 'Recipe', properties: ['name', 'ingredients', 'recipeInstructions', 'nutrition'] },
      'review': { type: 'Review', properties: ['reviewRating', 'author', 'reviewBody', 'datePublished'] }
    };

    // Check topic against patterns
    for (const [pattern, schema] of Object.entries(schemaPatterns)) {
      if (topicLower.includes(pattern) || analysis.categories?.includes(pattern)) {
        mappings.push({
          type: schema.type,
          name: `${topic} ${schema.type}`,
          description: `${schema.type} schema for ${topic}`,
          properties: schema.properties,
          confidence: 0.9
        });
      }
    }

    // If no matches, create a generic schema
    if (mappings.length === 0) {
      mappings.push({
        type: 'Thing',
        name: topic,
        description: `General schema for ${topic}`,
        properties: ['name', 'description', 'url', 'identifier'],
        confidence: 0.5
      });
    }

    return mappings;
  }

  /**
   * Build wiki links for the topic
   */
  async buildWikiLinks(topic, schemas) {
    const wikiLinks = [];

    // Generate Wikipedia links
    const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/\s+/g, '_'))}`;
    wikiLinks.push({
      type: 'wikipedia',
      url: wikipediaUrl,
      title: topic,
      relevance: 'primary'
    });

    // Add schema.org documentation links
    for (const schema of schemas) {
      if (schema['@type'] && schema['@type'] !== 'Thing') {
        wikiLinks.push({
          type: 'schema.org',
          url: `https://schema.org/${schema['@type']}`,
          title: schema['@type'],
          relevance: 'schema'
        });
      }
    }

    // Add MDN links for web-related topics
    if (topic.toLowerCase().includes('html') || topic.toLowerCase().includes('css') || topic.toLowerCase().includes('javascript')) {
      wikiLinks.push({
        type: 'mdn',
        url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}`,
        title: `MDN: ${topic}`,
        relevance: 'technical'
      });
    }

    return wikiLinks;
  }

  /**
   * Build knowledge graph
   */
  async buildKnowledgeGraph(topic, schemas, wikiLinks) {
    const graph = {
      nodes: [],
      edges: [],
      metadata: {
        topic,
        created_at: new Date().toISOString()
      }
    };

    // Add central topic node
    graph.nodes.push({
      id: `topic:${topic}`,
      type: 'topic',
      label: topic,
      properties: { primary: true }
    });

    // Add schema nodes
    schemas.forEach((schema, index) => {
      const nodeId = `schema:${schema['@type']}:${index}`;
      graph.nodes.push({
        id: nodeId,
        type: 'schema',
        label: schema['@type'],
        properties: schema
      });

      // Link to topic
      graph.edges.push({
        source: `topic:${topic}`,
        target: nodeId,
        type: 'has_schema',
        weight: schema.confidence || 0.5
      });
    });

    // Add wiki link nodes
    wikiLinks.forEach((link, index) => {
      const nodeId = `wiki:${link.type}:${index}`;
      graph.nodes.push({
        id: nodeId,
        type: 'wiki_reference',
        label: link.title,
        properties: link
      });

      // Link to topic
      graph.edges.push({
        source: `topic:${topic}`,
        target: nodeId,
        type: 'referenced_by',
        weight: link.relevance === 'primary' ? 1.0 : 0.7
      });
    });

    return graph;
  }

  /**
   * Get research instance
   */
  async getResearch(researchId) {
    let research = this.researchInstances.get(researchId);
    
    if (!research && this.db) {
      research = await this.loadResearchFromDB(researchId);
      if (research) {
        this.researchInstances.set(researchId, research);
      }
    }
    
    return research;
  }

  /**
   * Update research status
   */
  async updateResearchStatus(researchId, status, metadata = {}) {
    const research = this.researchInstances.get(researchId);
    if (!research) {
      throw new Error(`Research instance ${researchId} not found`);
    }

    research.status = status;
    research.updated_at = new Date().toISOString();
    research.metadata = { ...research.metadata, ...metadata };

    if (this.db) {
      await this.updateResearchInDB(research);
    }

    this.emit('researchStatusChanged', { researchId, status, metadata });
  }

  /**
   * List all research instances
   */
  async listResearch(filters = {}) {
    if (this.db) {
      return await this.listResearchFromDB(filters);
    }
    
    let research = Array.from(this.researchInstances.values());
    
    // Apply filters
    if (filters.status) {
      research = research.filter(r => r.status === filters.status);
    }
    
    if (filters.topic) {
      research = research.filter(r => r.topic.toLowerCase().includes(filters.topic.toLowerCase()));
    }
    
    return research;
  }

  // Database operations (to be implemented based on DB client)
  async saveResearchToDB(research) {
    if (!this.db) return;
    
    try {
      await this.db.query(
        `INSERT INTO research_instances 
        (research_id, topic, prompt, status, research_depth, discovered_schemas, wiki_links, knowledge_graph, metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          research.research_id,
          research.topic,
          research.prompt,
          research.status,
          research.research_depth,
          JSON.stringify(research.discovered_schemas),
          JSON.stringify(research.wiki_links),
          JSON.stringify(research.knowledge_graph),
          JSON.stringify(research.metadata),
          research.created_at,
          research.updated_at
        ]
      );
    } catch (error) {
      console.error('Failed to save research to database:', error);
    }
  }

  async updateResearchInDB(research) {
    if (!this.db) return;
    
    try {
      await this.db.query(
        `UPDATE research_instances 
        SET status = $1, discovered_schemas = $2, wiki_links = $3, knowledge_graph = $4, 
            metadata = $5, updated_at = $6, completed_at = $7
        WHERE research_id = $8`,
        [
          research.status,
          JSON.stringify(research.discovered_schemas),
          JSON.stringify(research.wiki_links),
          JSON.stringify(research.knowledge_graph),
          JSON.stringify(research.metadata),
          research.updated_at,
          research.completed_at || null,
          research.research_id
        ]
      );
    } catch (error) {
      console.error('Failed to update research in database:', error);
    }
  }

  async loadResearchFromDB(researchId) {
    if (!this.db) return null;
    
    try {
      const result = await this.db.query(
        'SELECT * FROM research_instances WHERE research_id = $1',
        [researchId]
      );
      
      if (result.rows && result.rows.length > 0) {
        return result.rows[0];
      }
    } catch (error) {
      console.error('Failed to load research from database:', error);
    }
    
    return null;
  }

  async listResearchFromDB(filters = {}) {
    if (!this.db) return [];
    
    try {
      let query = 'SELECT * FROM research_instances WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (filters.status) {
        query += ` AND status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      if (filters.topic) {
        query += ` AND topic ILIKE $${paramCount}`;
        params.push(`%${filters.topic}%`);
        paramCount++;
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      const result = await this.db.query(query, params);
      return result.rows || [];
    } catch (error) {
      console.error('Failed to list research from database:', error);
      return [];
    }
  }
}

// Export singleton instance
const researchInstanceService = new ResearchInstanceService();
export default researchInstanceService;
