/**
 * DeepSeek API Service
 * 
 * Provides integration with DeepSeek API for AI-powered workflow management,
 * crawler configuration generation, and schema building.
 * 
 * Features:
 * - Workflow generation from natural language prompts
 * - Schema generation and linking
 * - URL seed discovery and prioritization
 * - Campaign configuration optimization
 * - Function calling for linked workflows
 */

import axios from 'axios';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

class DeepSeekAPIService {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY;
    this.apiUrl = config.apiUrl || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    this.model = config.model || process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    this.timeout = config.timeout || 60000;
    this.maxRetries = config.maxRetries || 3;

    const urlHost = (() => {
      try {
        return new URL(this.apiUrl).hostname;
      } catch {
        return '';
      }
    })();

    const allowAnonymous =
      config.allowAnonymous ??
      (process.env.DEEPSEEK_ALLOW_ANON === 'true' || /^(localhost|127\.0\.0\.1)$/i.test(urlHost));

    const isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(urlHost);
    this.isOllama = isLocalhost;

    if (this.isOllama) {
      // Ollama expects requests at root; strip common suffixes like /v1
      this.apiUrl = this.apiUrl.replace(/\/?v1$/i, '');
    }

    if (!this.apiKey && !allowAnonymous) {
      console.warn('⚠️  DeepSeek API key not configured. Service will operate in mock mode.');
      this.mockMode = true;
    } else {
      this.mockMode = false;
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
    };

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: this.timeout,
      headers,
    });

    // Request cache to reduce API calls
    this.cache = new Map();
    this.cacheTTL = 300000; // 5 minutes
  }

  async chatCompletion(messages, options = {}) {
    const normalizedMessages = Array.isArray(messages)
      ? messages.filter(m => m && typeof m === 'object' && typeof m.content === 'string')
      : [];

    if (!normalizedMessages.length) {
      return 'No messages provided to DeepSeek chat completion.';
    }

    const temperature = options.temperature ?? 0.2;
    const maxTokens = options.maxTokens ?? 1200;

    if (this.mockMode && !this.isOllama) {
      const lastUser = normalizedMessages
        .slice()
        .reverse()
        .find(message => message.role === 'user');
      const prompt = lastUser?.content || 'Provide campaign guidance.';
      const fallback = this.mockGenerateWorkflow(prompt);
      return Array.isArray(fallback?.seeds)
        ? `Mock response: DeepSeek offline. Suggested focus areas include ${fallback.seeds.slice(0, 3).join(', ')}.`
        : 'Mock response: DeepSeek offline.';
    }

    try {
      if (this.isOllama) {
        const payload = {
          model: this.model,
          messages: normalizedMessages,
          stream: false,
          options: { temperature },
        };

        if (options.maxTokens !== undefined) {
          payload.options.num_predict = maxTokens;
        }

        const response = await this.client.post('/api/chat', payload);
        const content =
          response.data?.message?.content ??
          response.data?.response ??
          response.data?.choices?.[0]?.message?.content ??
          '';
        return typeof content === 'string' && content.trim().length
          ? content
          : 'The Ollama backend returned an empty response.';
      }

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: normalizedMessages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      });

      const content = response.data?.choices?.[0]?.message?.content ?? '';
      if (typeof content === 'string' && content.trim().length) {
        return content;
      }

      return 'DeepSeek returned an empty response for the provided prompt.';
    } catch (error) {
      console.error('DeepSeek chatCompletion error:', error.message);
      if (this.mockMode) {
        return 'Fallback response: DeepSeek chat unavailable.';
      }
      throw error;
    }
  }

  createChatStream(messages, options = {}) {
    if (this.mockMode && !this.isOllama) {
      return Readable.from([
        JSON.stringify({ type: 'message', content: 'Mock response: DeepSeek offline.' }),
        '\n',
      ]);
    }

    if (this.isOllama) {
      const controller = new Readable({
        read() {},
      });

      (async () => {
        try {
          const payload = {
            model: this.model,
            messages,
            stream: true,
            options,
          };
          const response = await this.client.post('/api/chat', payload, { responseType: 'stream' });

          response.data.on('data', (chunk) => {
            controller.push(chunk);
          });

          response.data.on('end', () => {
            controller.push(null);
          });

          response.data.on('error', (err) => {
            controller.destroy(err);
          });
        } catch (error) {
          controller.destroy(error);
        }
      })();

      return controller;
    }

    const controller = new Readable({
      read() {},
    });

    (async () => {
      try {
        const response = await this.client.post(
          '/chat/completions',
          {
            model: this.model,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 2000,
            stream: true,
          },
          { responseType: 'stream' },
        );

        response.data.on('data', (chunk) => {
          controller.push(chunk);
        });

        response.data.on('end', () => {
          controller.push(null);
        });

        response.data.on('error', (err) => {
          controller.destroy(err);
        });
      } catch (error) {
        controller.destroy(error);
      }
    })();

    return controller;
  }

  /**
   * Generate crawler workflow configuration from natural language prompt
   */
  async generateWorkflowFromPrompt(prompt, options = {}) {
    const cacheKey = `workflow:${prompt}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (this.mockMode && !this.isOllama) {
      return this.mockGenerateWorkflow(prompt);
    }

    try {
      const systemPrompt = `You are an expert crawler workflow architect. Generate a comprehensive crawler configuration based on the user's request.
      
Output a JSON object with this structure:
{
  "workflowName": "string",
  "description": "string",
  "seeds": ["url1", "url2", ...],
  "schema": {
    "name": "string",
    "attributes": ["attr1", "attr2", ...],
    "relationships": {}
  },
  "configuration": {
    "maxDepth": number,
    "parallelCrawlers": number,
    "rateLimit": number,
    "respectRobotsTxt": boolean,
    "timeout": number
  },
  "schedule": {
    "frequency": "hourly|daily|weekly|monthly",
    "time": "HH:MM",
    "enabled": boolean
  },
  "analytics": {
    "trackPageViews": boolean,
    "trackErrors": boolean,
    "trackPerformance": boolean
  }
}`;

      let content;

      if (this.isOllama) {
        const payload = {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: false,
          options: {},
        };

        if (options.temperature !== undefined) {
          payload.options.temperature = options.temperature;
        }

        if (options.maxTokens !== undefined) {
          payload.options.num_predict = options.maxTokens;
        }

        const response = await this.client.post('/api/chat', payload);
        content = response.data?.message?.content;
      } else {
        const response = await this.client.post('/chat/completions', {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
          response_format: { type: 'json_object' },
        });

        content = response.data.choices[0].message.content;
      }

      let workflow;
      try {
        workflow = JSON.parse(content);
      } catch (parseError) {
        workflow = {
          workflowName: 'Generated Workflow',
          description: typeof content === 'string' ? content : 'No structured response available',
          summary: typeof content === 'string' ? content : 'No structured response available',
          rawResponse: content,
        };
      }

      if (!workflow.summary) {
        workflow.summary = workflow.description || `Workflow generated from prompt: ${prompt}`;
      }

      this.setCache(cacheKey, workflow);
      return workflow;
    } catch (error) {
      console.error('DeepSeek API Error:', error.message);
      // Fallback to mock mode on error
      return this.mockGenerateWorkflow(prompt);
    }
  }

  /**
   * Generate URL seeds from campaign description
   */
  async generateURLSeeds(campaignDescription, clientSiteUrl, options = {}) {
    const cacheKey = `seeds:${campaignDescription}:${clientSiteUrl}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (this.mockMode) {
      return this.mockGenerateSeeds(clientSiteUrl);
    }

    try {
      const systemPrompt = `You are an SEO and web crawling expert. Generate a list of relevant URLs to crawl for SEO training data.
      
Given a client site and campaign description, suggest:
1. The client's main pages to crawl
2. Related industry websites for competitive analysis
3. High-authority sites in the same niche
4. Content sources for training data

Output JSON:
{
  "primarySeeds": ["url1", "url2", ...],
  "competitorSeeds": ["url1", "url2", ...],
  "authoritySeeds": ["url1", "url2", ...],
  "trainingDataSeeds": ["url1", "url2", ...],
  "priority": {"url": number, ...}
}`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Client site: ${clientSiteUrl}\n\nCampaign: ${campaignDescription}` }
        ],
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const content = response.data.choices[0].message.content;
      const seeds = JSON.parse(content);
      
      this.setCache(cacheKey, seeds);
      return seeds;
    } catch (error) {
      console.error('DeepSeek API Error:', error.message);
      return this.mockGenerateSeeds(clientSiteUrl);
    }
  }

  /**
   * Build schema for crawler data collection
   */
  async buildCrawlerSchema(purpose, existingSchemas = [], options = {}) {
    const cacheKey = `schema:${purpose}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (this.mockMode) {
      return this.mockBuildSchema(purpose);
    }

    try {
      const systemPrompt = `You are a data schema architect. Design a schema for web crawler data collection.
      
Create a schema that:
1. Captures essential data attributes
2. Links to related schemas (forward/backward references)
3. Supports function calling and workflow pipelines
4. Enables analytics and reporting

Output JSON:
{
  "schemaName": "string",
  "description": "string",
  "version": "1.0.0",
  "attributes": [
    {
      "name": "string",
      "type": "string|number|boolean|object|array",
      "required": boolean,
      "description": "string",
      "validators": []
    }
  ],
  "linkedSchemas": {
    "forward": ["schemaName1", ...],
    "backward": ["schemaName2", ...]
  },
  "indexes": ["field1", "field2", ...],
  "triggers": [
    {
      "event": "onCreate|onUpdate|onDelete",
      "action": "string",
      "linkedWorkflow": "string"
    }
  ]
}`;

      const userPrompt = `Purpose: ${purpose}\n\nExisting schemas: ${existingSchemas.join(', ')}`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = response.data.choices[0].message.content;
      const schema = JSON.parse(content);
      
      this.setCache(cacheKey, schema);
      return schema;
    } catch (error) {
      console.error('DeepSeek API Error:', error.message);
      return this.mockBuildSchema(purpose);
    }
  }

  /**
   * Optimize crawler configuration based on analytics
   */
  async optimizeCrawlerConfig(currentConfig, analyticsData, options = {}) {
    if (this.mockMode) {
      return { ...currentConfig, parallelCrawlers: Math.min(currentConfig.parallelCrawlers + 2, 20) };
    }

    try {
      const systemPrompt = `You are a crawler optimization expert. Analyze performance data and suggest configuration improvements.

Optimize for:
1. Maximum throughput
2. Resource efficiency
3. Error reduction
4. Cost-effectiveness

Output JSON with optimized configuration.`;

      const userPrompt = `Current config: ${JSON.stringify(currentConfig)}\n\nAnalytics: ${JSON.stringify(analyticsData)}`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('DeepSeek API Error:', error.message);
      return currentConfig;
    }
  }

  /**
   * Generate workflow pipeline from linked schemas
   */
  async generateWorkflowPipeline(schemas, goal, options = {}) {
    if (this.mockMode) {
      return this.mockGeneratePipeline(schemas);
    }

    try {
      const systemPrompt = `You are a workflow pipeline architect. Create an execution pipeline from linked schemas.

Design a pipeline that:
1. Executes schemas in optimal order
2. Handles dependencies and relationships
3. Supports parallel execution where possible
4. Includes error handling and rollback

Output JSON:
{
  "pipelineName": "string",
  "stages": [
    {
      "name": "string",
      "schemas": ["schema1", ...],
      "parallel": boolean,
      "dependencies": ["stage1", ...],
      "errorHandling": "retry|skip|fail"
    }
  ],
  "functionCalls": [
    {
      "trigger": "string",
      "schema": "string",
      "function": "string",
      "params": {}
    }
  ]
}`;

      const userPrompt = `Schemas: ${JSON.stringify(schemas)}\n\nGoal: ${goal}`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('DeepSeek API Error:', error.message);
      return this.mockGeneratePipeline(schemas);
    }
  }

  /**
   * Research neural network server setup requirements
   */
  async researchNeuralNetworkSetup(requirements, options = {}) {
    if (this.mockMode) {
      return this.mockNeuralNetworkResearch();
    }

    try {
      const systemPrompt = `You are a machine learning infrastructure expert. Provide detailed setup instructions for neural network servers.

Include:
1. Hardware requirements (CPU, GPU, RAM, storage)
2. Software stack (OS, frameworks, libraries)
3. Configuration recommendations
4. Scaling strategies
5. Cost estimates

Output JSON with structured recommendations.`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Requirements: ${JSON.stringify(requirements)}` }
        ],
        temperature: 0.3,
        max_tokens: 2500
      });

      const content = response.data.choices[0].message.content;
      return { research: content, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('DeepSeek API Error:', error.message);
      return this.mockNeuralNetworkResearch();
    }
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const { data, timestamp } = cached;
    if (Date.now() - timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Mock implementations for when API is not available
  mockGenerateWorkflow(prompt) {
    const baseUrl = prompt.match(/https?:\/\/[^\s]+/)?.[0] || 'https://example.com';
    
    return {
      workflowName: 'SEO Training Data Collection',
      description: `Automated workflow for ${prompt}`,
      summary: `Generated automation workflow in response to: ${prompt}`,
      seeds: [
        baseUrl,
        `${baseUrl}/blog`,
        `${baseUrl}/products`,
        `${baseUrl}/about`
      ],
      schema: {
        name: 'seo_training_data',
        attributes: ['url', 'title', 'meta_description', 'content', 'headings', 'links', 'images'],
        relationships: {
          linkedSchemas: ['page_performance', 'seo_metrics']
        }
      },
      configuration: {
        maxDepth: 3,
        parallelCrawlers: 5,
        rateLimit: 100,
        respectRobotsTxt: true,
        timeout: 30000
      },
      schedule: {
        frequency: 'daily',
        time: '02:00',
        enabled: true
      },
      analytics: {
        trackPageViews: true,
        trackErrors: true,
        trackPerformance: true
      }
    };
  }

  mockGenerateSeeds(clientSiteUrl) {
    const domain = new URL(clientSiteUrl).hostname;
    
    return {
      primarySeeds: [
        clientSiteUrl,
        `${clientSiteUrl}/blog`,
        `${clientSiteUrl}/products`,
        `${clientSiteUrl}/services`,
        `${clientSiteUrl}/about`,
        `${clientSiteUrl}/contact`
      ],
      competitorSeeds: [
        `https://competitor1.com`,
        `https://competitor2.com`
      ],
      authoritySeeds: [
        'https://moz.com/blog',
        'https://searchengineland.com',
        'https://www.searchenginejournal.com'
      ],
      trainingDataSeeds: [
        'https://example.com/industry-news',
        'https://example.com/best-practices'
      ],
      priority: {
        [clientSiteUrl]: 10,
        [`${clientSiteUrl}/blog`]: 9,
        [`${clientSiteUrl}/products`]: 9
      }
    };
  }

  mockBuildSchema(purpose) {
    return {
      schemaName: 'crawler_data_schema',
      description: `Schema for ${purpose}`,
      version: '1.0.0',
      attributes: [
        {
          name: 'url',
          type: 'string',
          required: true,
          description: 'Crawled page URL',
          validators: ['url']
        },
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'Page title',
          validators: []
        },
        {
          name: 'content',
          type: 'string',
          required: true,
          description: 'Main page content',
          validators: []
        },
        {
          name: 'metadata',
          type: 'object',
          required: false,
          description: 'Page metadata',
          validators: []
        },
        {
          name: 'crawled_at',
          type: 'string',
          required: true,
          description: 'Timestamp of crawl',
          validators: ['iso8601']
        }
      ],
      linkedSchemas: {
        forward: ['seo_metrics', 'page_performance'],
        backward: ['crawl_job']
      },
      indexes: ['url', 'crawled_at'],
      triggers: [
        {
          event: 'onCreate',
          action: 'analyze_seo',
          linkedWorkflow: 'seo_analysis_pipeline'
        },
        {
          event: 'onCreate',
          action: 'extract_links',
          linkedWorkflow: 'link_discovery_pipeline'
        }
      ]
    };
  }

  mockGeneratePipeline(schemas) {
    return {
      pipelineName: 'Crawler Data Processing Pipeline',
      stages: [
        {
          name: 'Data Collection',
          schemas: ['crawler_data'],
          parallel: true,
          dependencies: [],
          errorHandling: 'retry'
        },
        {
          name: 'Analysis',
          schemas: ['seo_metrics', 'page_performance'],
          parallel: true,
          dependencies: ['Data Collection'],
          errorHandling: 'retry'
        },
        {
          name: 'Storage',
          schemas: ['training_data'],
          parallel: false,
          dependencies: ['Analysis'],
          errorHandling: 'fail'
        }
      ],
      functionCalls: [
        {
          trigger: 'onCrawlComplete',
          schema: 'crawler_data',
          function: 'analyzeSEO',
          params: { depth: 'full' }
        },
        {
          trigger: 'onAnalysisComplete',
          schema: 'seo_metrics',
          function: 'storeTrainingData',
          params: { format: 'json' }
        }
      ]
    };
  }

  mockNeuralNetworkResearch() {
    return {
      research: `
# Neural Network Server Setup Recommendations

## Hardware Requirements

### Minimum Configuration
- **CPU**: 8-core processor (AMD Ryzen 7 or Intel i7)
- **GPU**: NVIDIA RTX 3060 (12GB VRAM) or better
- **RAM**: 32GB DDR4
- **Storage**: 1TB NVMe SSD

### Recommended Configuration
- **CPU**: 16-core processor (AMD Ryzen 9 or Intel i9)
- **GPU**: NVIDIA RTX 4090 (24GB VRAM) or A100
- **RAM**: 64GB DDR4/DDR5
- **Storage**: 2TB NVMe SSD + 4TB HDD

## Software Stack

### Operating System
- Ubuntu 22.04 LTS (recommended)
- Docker + NVIDIA Container Runtime

### Frameworks
- PyTorch 2.0+ or TensorFlow 2.x
- CUDA 12.0+
- cuDNN 8.x

### Libraries
- NumPy, Pandas, Scikit-learn
- Transformers (Hugging Face)
- FastAPI or Flask for API endpoints

## Scaling Strategies

1. **Horizontal Scaling**: Add more GPU nodes
2. **Model Parallelism**: Split model across GPUs
3. **Data Parallelism**: Distribute data across nodes
4. **Kubernetes**: Orchestrate with K8s + NVIDIA GPU Operator

## Cost Estimates

- **Cloud (AWS p3.2xlarge)**: ~$3.06/hour
- **Cloud (AWS p3.8xlarge)**: ~$12.24/hour
- **On-premise**: $5,000-$15,000 initial + electricity
`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (this.mockMode) {
      return {
        status: 'healthy',
        mode: 'mock',
        message: 'Running in mock mode (API key not configured)'
      };
    }

    try {
      // Simple API test
      const response = await this.client.get('/models');
      return {
        status: 'healthy',
        mode: 'live',
        message: 'DeepSeek API is accessible',
        models: response.data.data?.map(m => m.id) || []
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        mode: 'error',
        message: error.message
      };
    }
  }
}

// Export singleton instance
const deepSeekService = new DeepSeekAPIService();

export default deepSeekService;
export { DeepSeekAPIService };
