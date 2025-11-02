/**
 * AI-Powered Mining Configuration Generator
 * Uses Ollama (DeepSeek-R1 or other models) to generate crawler configurations
 * from natural language prompts
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export class AIConfigGenerator {
  constructor(options = {}) {
    this.ollamaUrl = options.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
    this.defaultModel = options.model || 'deepseek-r1:latest';
    this.temperature = options.temperature || 0.7;
  }

  /**
   * Generate mining configuration from natural language prompt
   */
  async generateConfig(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    
    console.log(`🤖 Generating config with ${model}...`);

    // Construct system prompt
    const systemPrompt = this.buildSystemPrompt();
    
    // Construct user prompt
    const userPrompt = this.buildUserPrompt(prompt, options);

    try {
      // Call Ollama API
      const response = await this.callOllama(model, systemPrompt, userPrompt);
      
      // Parse and validate response
      const config = this.parseResponse(response);
      
      // Enhance config with defaults and best practices
      const enhancedConfig = this.enhanceConfig(config, prompt);
      
      return enhancedConfig;
    } catch (error) {
      console.error('❌ AI config generation failed:', error.message);
      
      // Fallback to template-based generation
      return this.generateFallbackConfig(prompt, options);
    }
  }

  /**
   * Build system prompt for AI
   */
  buildSystemPrompt() {
    return `You are an expert web scraping and data mining configuration generator. Your task is to analyze natural language requests and generate precise, efficient crawler configurations.

Your output must be valid JSON following this schema:

{
  "name": "string - Descriptive name for the mining job",
  "subject": "string - Single-word subject identifier (e.g., 'news', 'products', 'research')",
  "description": "string - Detailed description of what data to mine",
  "seedUrls": ["array of strings - Starting URLs to crawl"],
  "attributes": [
    {
      "name": "string - Attribute name (e.g., 'title', 'price', 'author')",
      "selector": "string - CSS selector or null for auto-detection",
      "extractor": "string - Optional JavaScript function for custom extraction",
      "priority": "number - 1-10, higher means mine first",
      "schemaVersion": "string - Version for cache invalidation",
      "dataType": "string - Type of data (text, number, date, url, image, etc.)",
      "validation": {
        "required": "boolean",
        "minLength": "number - optional",
        "maxLength": "number - optional",
        "pattern": "string - regex pattern - optional"
      }
    }
  ],
  "config": {
    "maxDepth": "number - How deep to crawl (1-10)",
    "maxUrls": "number - Maximum URLs to process",
    "respectRobotsTxt": "boolean - Whether to respect robots.txt",
    "followExternalLinks": "boolean - Whether to follow links outside seed domains",
    "urlPatterns": {
      "include": ["array of regex patterns to include"],
      "exclude": ["array of regex patterns to exclude"]
    },
    "rateLimitMs": "number - Milliseconds between requests",
    "timeout": "number - Request timeout in ms"
  },
  "scheduling": {
    "enabled": "boolean - Whether to schedule recurring mining",
    "frequency": "string - cron expression or 'hourly', 'daily', 'weekly'",
    "maxRuns": "number - optional limit on runs"
  }
}

Guidelines:
1. Always include at least one seed URL
2. Prioritize attributes by importance (title/name should be 10, metadata should be lower)
3. Use CSS selectors when possible (faster than XPath)
4. Set realistic maxDepth (2-3 for most sites)
5. Include rate limiting to be respectful
6. Add validation rules for critical attributes
7. Consider data types for proper storage and training
8. Suggest URL patterns to focus crawling

Respond ONLY with valid JSON, no additional text or markdown.`;
  }

  /**
   * Build user prompt from input
   */
  buildUserPrompt(prompt, options) {
    let userPrompt = `Generate a web crawler configuration for: ${prompt}`;

    if (options.targetUrls) {
      userPrompt += `\n\nTarget URLs: ${options.targetUrls.join(', ')}`;
    }

    if (options.dataTypes) {
      userPrompt += `\n\nFocus on these data types: ${options.dataTypes.join(', ')}`;
    }

    if (options.examples) {
      userPrompt += `\n\nExamples of data to extract: ${JSON.stringify(options.examples)}`;
    }

    return userPrompt;
  }

  /**
   * Call Ollama API
   */
  async callOllama(model, systemPrompt, userPrompt) {
    const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
      model: model,
      prompt: `${systemPrompt}\n\nUser Request:\n${userPrompt}`,
      temperature: this.temperature,
      stream: false
    }, {
      timeout: 60000 // 60 second timeout
    });

    if (!response.data || !response.data.response) {
      throw new Error('Invalid response from Ollama');
    }

    return response.data.response;
  }

  /**
   * Parse AI response into config object
   */
  parseResponse(response) {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');
    cleaned = cleaned.trim();

    try {
      const config = JSON.parse(cleaned);
      return config;
    } catch (error) {
      // Try to extract JSON from response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse AI response as JSON');
    }
  }

  /**
   * Enhance config with defaults and best practices
   */
  enhanceConfig(config, originalPrompt) {
    const enhanced = {
      ...config,
      id: uuidv4(),
      generatedBy: 'ai',
      originalPrompt: originalPrompt,
      generatedAt: new Date().toISOString()
    };

    // Ensure required fields
    if (!enhanced.subject) {
      enhanced.subject = this.extractSubject(originalPrompt);
    }

    if (!enhanced.name) {
      enhanced.name = `Mining: ${enhanced.subject}`;
    }

    // Ensure attributes have required fields
    enhanced.attributes = enhanced.attributes.map((attr, index) => ({
      name: attr.name,
      selector: attr.selector || null,
      extractor: attr.extractor || null,
      priority: attr.priority || (10 - index), // Decreasing priority
      schemaVersion: attr.schemaVersion || '1.0.0',
      dataType: attr.dataType || 'text',
      validation: attr.validation || { required: true },
      ...attr
    }));

    // Ensure config defaults
    enhanced.config = {
      maxDepth: 3,
      maxUrls: 1000,
      respectRobotsTxt: true,
      followExternalLinks: false,
      rateLimitMs: 1000,
      timeout: 30000,
      ...enhanced.config
    };

    // Add scheduling if not present
    if (!enhanced.scheduling) {
      enhanced.scheduling = {
        enabled: false,
        frequency: 'daily',
        maxRuns: null
      };
    }

    return enhanced;
  }

  /**
   * Extract subject from prompt
   */
  extractSubject(prompt) {
    const words = prompt.toLowerCase().split(/\s+/);
    
    // Remove common words
    const stopWords = ['the', 'a', 'an', 'for', 'about', 'from', 'mine', 'data', 'extract', 'crawl', 'scrape'];
    const meaningful = words.filter(w => !stopWords.includes(w) && w.length > 2);
    
    if (meaningful.length > 0) {
      return meaningful[0];
    }
    
    return 'general';
  }

  /**
   * Generate fallback config when AI fails
   */
  generateFallbackConfig(prompt, options) {
    console.log('⚠️  Using fallback config generation');

    const subject = this.extractSubject(prompt);
    
    return {
      id: uuidv4(),
      name: `Mining: ${subject}`,
      subject: subject,
      description: prompt,
      seedUrls: options.targetUrls || [],
      attributes: [
        {
          name: 'title',
          selector: 'h1, title',
          priority: 10,
          schemaVersion: '1.0.0',
          dataType: 'text',
          validation: { required: true, minLength: 1, maxLength: 500 }
        },
        {
          name: 'content',
          selector: 'article, main, .content, body',
          priority: 8,
          schemaVersion: '1.0.0',
          dataType: 'text',
          validation: { required: true, minLength: 10 }
        },
        {
          name: 'links',
          selector: 'a[href]',
          priority: 6,
          schemaVersion: '1.0.0',
          dataType: 'url',
          validation: { required: false }
        },
        {
          name: 'images',
          selector: 'img[src]',
          priority: 5,
          schemaVersion: '1.0.0',
          dataType: 'image',
          validation: { required: false }
        },
        {
          name: 'metadata',
          selector: 'meta',
          priority: 4,
          schemaVersion: '1.0.0',
          dataType: 'json',
          validation: { required: false }
        }
      ],
      config: {
        maxDepth: 3,
        maxUrls: 1000,
        respectRobotsTxt: true,
        followExternalLinks: false,
        rateLimitMs: 1000,
        timeout: 30000,
        urlPatterns: {
          include: ['.*'],
          exclude: ['\\.pdf$', '\\.zip$', '\\.exe$']
        }
      },
      scheduling: {
        enabled: false,
        frequency: 'daily',
        maxRuns: null
      },
      generatedBy: 'fallback',
      originalPrompt: prompt,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Validate generated config
   */
  validateConfig(config) {
    const errors = [];

    if (!config.subject) {
      errors.push('Missing required field: subject');
    }

    if (!config.seedUrls || config.seedUrls.length === 0) {
      errors.push('Must provide at least one seed URL');
    }

    if (!config.attributes || config.attributes.length === 0) {
      errors.push('Must define at least one attribute to extract');
    }

    // Validate seed URLs
    for (const url of config.seedUrls || []) {
      try {
        new URL(url);
      } catch (e) {
        errors.push(`Invalid seed URL: ${url}`);
      }
    }

    // Validate attributes
    for (const attr of config.attributes || []) {
      if (!attr.name) {
        errors.push('Attribute missing required field: name');
      }
      if (attr.priority !== undefined && (attr.priority < 1 || attr.priority > 10)) {
        errors.push(`Attribute ${attr.name} has invalid priority (must be 1-10)`);
      }
    }

    return errors;
  }

  /**
   * Save config to file
   */
  async saveConfig(config, filepath) {
    const fs = await import('fs/promises');
    await fs.writeFile(
      filepath,
      JSON.stringify(config, null, 2),
      'utf-8'
    );
  }

  /**
   * Test if Ollama is available
   */
  async testConnection() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * List available models
   */
  async listModels() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to list models:', error.message);
      return [];
    }
  }

  /**
   * Get recommended model for mining config generation
   */
  async getRecommendedModel() {
    const models = await this.listModels();
    
    // Prefer DeepSeek-R1 for reasoning tasks
    const preferred = [
      'deepseek-r1',
      'deepseek-r1:latest',
      'llama3',
      'llama3:latest',
      'mixtral',
      'mixtral:latest'
    ];

    for (const modelName of preferred) {
      if (models.some(m => m.name === modelName)) {
        return modelName;
      }
    }

    // Return first available model or default
    return models.length > 0 ? models[0].name : this.defaultModel;
  }
}

export default AIConfigGenerator;
