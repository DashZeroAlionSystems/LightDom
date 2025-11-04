/**
 * DeepSeek Integration Service
 * Service for integrating with DeepSeek API for agent instances
 */

import axios, { AxiosInstance } from 'axios';
import { Pool } from 'pg';
import { DeepSeekConfig, DeepSeekFineTuneConfig } from '../types/agent-management';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DeepSeekIntegrationService {
  private client: AxiosInstance;
  private db: Pool;
  private defaultConfig: DeepSeekConfig;

  constructor(db: Pool, config?: Partial<DeepSeekConfig>) {
    this.db = db;
    this.defaultConfig = {
      api_url: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
      api_key: process.env.DEEPSEEK_API_KEY,
      model: config?.model || 'deepseek-coder',
      temperature: config?.temperature || 0.7,
      max_tokens: config?.max_tokens || 4096,
      top_p: config?.top_p || 1.0,
      frequency_penalty: config?.frequency_penalty || 0,
      presence_penalty: config?.presence_penalty || 0
    };

    this.client = axios.create({
      baseURL: this.defaultConfig.api_url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.defaultConfig.api_key}`
      },
      timeout: 60000
    });
  }

  /**
   * Send a chat completion request to DeepSeek
   */
  async chat(
    messages: DeepSeekMessage[],
    instanceConfig?: Partial<DeepSeekConfig>
  ): Promise<DeepSeekResponse> {
    const config = { ...this.defaultConfig, ...instanceConfig };

    const payload = {
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      top_p: config.top_p,
      frequency_penalty: config.frequency_penalty,
      presence_penalty: config.presence_penalty,
      stop: config.stop
    };

    try {
      const response = await this.client.post('/chat/completions', payload);
      return response.data;
    } catch (error: any) {
      console.error('DeepSeek API error:', error.response?.data || error.message);
      throw new Error(`DeepSeek API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Send a prompt with codebase context
   */
  async promptWithContext(
    instanceId: string,
    userPrompt: string,
    includeSchemaMap: boolean = true,
    includePatternRules: boolean = true
  ): Promise<{ response: string; tokensUsed: number }> {
    // Get instance configuration
    const instanceQuery = 'SELECT * FROM agent_instances WHERE instance_id = $1';
    const instanceResult = await this.db.query(instanceQuery, [instanceId]);
    
    if (instanceResult.rows.length === 0) {
      throw new Error('Agent instance not found');
    }

    const instance = instanceResult.rows[0];
    const messages: DeepSeekMessage[] = [];

    // Build system message with context
    let systemContent = 'You are an AI coding assistant with deep knowledge of this codebase.';

    if (includeSchemaMap && instance.schema_map) {
      systemContent += '\n\nCodebase Structure:\n' + JSON.stringify(instance.schema_map, null, 2);
    }

    if (includePatternRules && instance.pattern_rules) {
      systemContent += '\n\nCodebase Patterns and Rules:\n' + JSON.stringify(instance.pattern_rules, null, 2);
    }

    messages.push({
      role: 'system',
      content: systemContent
    });

    // Add conversation history
    const historyQuery = `
      SELECT role, content FROM agent_messages
      WHERE instance_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const historyResult = await this.db.query(historyQuery, [instanceId]);
    
    // Add history in chronological order
    for (let i = historyResult.rows.length - 1; i >= 0; i--) {
      const msg = historyResult.rows[i];
      messages.push({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      });
    }

    // Add current user prompt
    messages.push({
      role: 'user',
      content: userPrompt
    });

    // Send to DeepSeek
    const instanceConfig: Partial<DeepSeekConfig> = {
      model: instance.model_name,
      temperature: instance.temperature,
      max_tokens: instance.max_tokens
    };

    const response = await this.chat(messages, instanceConfig);

    return {
      response: response.choices[0].message.content,
      tokensUsed: response.usage.total_tokens
    };
  }

  /**
   * Create a fine-tuned model (if DeepSeek supports it)
   */
  async createFineTune(
    trainingData: string,
    config: DeepSeekFineTuneConfig
  ): Promise<{ job_id: string; status: string }> {
    // Note: This is a placeholder implementation
    // Actual implementation depends on DeepSeek's fine-tuning API
    
    try {
      const payload = {
        training_file: trainingData,
        model: 'deepseek-coder',
        ...config
      };

      const response = await this.client.post('/fine-tunes', payload);
      
      return {
        job_id: response.data.id,
        status: response.data.status
      };
    } catch (error: any) {
      console.error('Fine-tune creation error:', error.response?.data || error.message);
      throw new Error(`Failed to create fine-tune: ${error.message}`);
    }
  }

  /**
   * Check fine-tune job status
   */
  async getFineTuneStatus(jobId: string): Promise<any> {
    try {
      const response = await this.client.get(`/fine-tunes/${jobId}`);
      return response.data;
    } catch (error: any) {
      console.error('Fine-tune status error:', error.response?.data || error.message);
      throw new Error(`Failed to get fine-tune status: ${error.message}`);
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<any[]> {
    try {
      const response = await this.client.get('/models');
      return response.data.data || [];
    } catch (error: any) {
      console.error('List models error:', error.response?.data || error.message);
      throw new Error(`Failed to list models: ${error.message}`);
    }
  }

  /**
   * Generate code completion
   */
  async complete(
    prompt: string,
    suffix?: string,
    config?: Partial<DeepSeekConfig>
  ): Promise<string> {
    const mergedConfig = { ...this.defaultConfig, ...config };

    try {
      const response = await this.client.post('/completions', {
        model: mergedConfig.model,
        prompt,
        suffix,
        max_tokens: mergedConfig.max_tokens,
        temperature: mergedConfig.temperature
      });

      return response.data.choices[0].text;
    } catch (error: any) {
      console.error('Completion error:', error.response?.data || error.message);
      throw new Error(`Failed to generate completion: ${error.message}`);
    }
  }

  /**
   * Analyze code for issues
   */
  async analyzeCode(code: string, language: string): Promise<{
    issues: any[];
    suggestions: string[];
  }> {
    const prompt = `Analyze the following ${language} code for potential issues, bugs, and improvements:\n\n${code}\n\nProvide a detailed analysis in JSON format with 'issues' and 'suggestions' arrays.`;

    const response = await this.chat([
      {
        role: 'system',
        content: 'You are a code analysis expert. Always respond with valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    try {
      const analysis = JSON.parse(response.choices[0].message.content);
      return {
        issues: analysis.issues || [],
        suggestions: analysis.suggestions || []
      };
    } catch (error) {
      // If response is not JSON, parse it manually
      return {
        issues: [],
        suggestions: [response.choices[0].message.content]
      };
    }
  }

  /**
   * Generate schema from example data
   */
  async generateSchema(
    sampleData: any,
    schemaType: 'json-schema' | 'typescript' | 'database' = 'json-schema'
  ): Promise<any> {
    const prompt = `Generate a ${schemaType} schema for the following data:\n\n${JSON.stringify(sampleData, null, 2)}\n\nRespond with only the schema in JSON format.`;

    const response = await this.chat([
      {
        role: 'system',
        content: 'You are a schema generation expert. Always respond with valid JSON schemas.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      throw new Error('Failed to parse generated schema');
    }
  }

  /**
   * Refactor code with specific instructions
   */
  async refactorCode(
    code: string,
    instructions: string,
    language: string
  ): Promise<string> {
    const prompt = `Refactor the following ${language} code according to these instructions: ${instructions}\n\nOriginal code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide only the refactored code without explanations.`;

    const response = await this.chat([
      {
        role: 'system',
        content: 'You are a code refactoring expert. Provide clean, optimized code.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    return response.choices[0].message.content;
  }

  /**
   * Explain code functionality
   */
  async explainCode(code: string, language: string): Promise<string> {
    const prompt = `Explain what the following ${language} code does:\n\n\`\`\`${language}\n${code}\n\`\`\``;

    const response = await this.chat([
      {
        role: 'system',
        content: 'You are a code documentation expert. Provide clear, concise explanations.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    return response.choices[0].message.content;
  }

  /**
   * Generate unit tests for code
   */
  async generateTests(
    code: string,
    language: string,
    testFramework: string = 'jest'
  ): Promise<string> {
    const prompt = `Generate ${testFramework} unit tests for the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide comprehensive test coverage.`;

    const response = await this.chat([
      {
        role: 'system',
        content: `You are a testing expert. Generate comprehensive ${testFramework} tests.`
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    return response.choices[0].message.content;
  }
}
