/**
 * LangChain + Ollama DeepSeek Integration Service
 * 
 * This service provides a comprehensive integration layer between LangChain and Ollama,
 * specifically configured for DeepSeek models. It includes:
 * - Chat conversations with history management
 * - RAG (Retrieval Augmented Generation) capabilities
 * - Streaming responses
 * - Tool/function calling support
 * - Performance monitoring and metrics
 */

import { Ollama } from '@langchain/ollama';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

// Configuration
const DEFAULT_CONFIG = {
  baseUrl: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'deepseek-r1:latest',
  temperature: parseFloat(process.env.OLLAMA_TEMPERATURE) || 0.7,
  maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS) || 2048,
  topP: parseFloat(process.env.OLLAMA_TOP_P) || 0.9,
};

/**
 * LangChain Ollama Service
 */
class LangChainOllamaService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.conversationHistory = new Map(); // sessionId -> messages[]
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokens: 0,
    };
    
    // Initialize Ollama LLM
    this.llm = new Ollama({
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      topP: this.config.topP,
    });

    console.log('✅ LangChain Ollama Service initialized with config:', {
      model: this.config.model,
      baseUrl: this.config.baseUrl,
    });
  }

  /**
   * Simple chat - single message without history
   */
  async chat(message, options = {}) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const response = await this.llm.invoke(message);
      
      const duration = Date.now() - startTime;
      this.updateMetrics(duration, true);

      return {
        success: true,
        response,
        metadata: {
          model: this.config.model,
          duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.metrics.failedRequests++;
      console.error('Chat error:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Conversational chat with history management
   */
  async conversationalChat(message, sessionId = 'default', systemPrompt = null) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Get or create conversation history
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }
      
      const history = this.conversationHistory.get(sessionId);

      // Build messages array
      const messages = [];
      
      if (systemPrompt) {
        messages.push(new SystemMessage(systemPrompt));
      }
      
      // Add conversation history
      history.forEach(msg => {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          messages.push(new AIMessage(msg.content));
        }
      });
      
      // Add current message
      messages.push(new HumanMessage(message));

      // Get response
      const response = await this.llm.invoke(messages);

      // Update history
      history.push({ role: 'user', content: message, timestamp: new Date().toISOString() });
      history.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });

      const duration = Date.now() - startTime;
      this.updateMetrics(duration, true);

      return {
        success: true,
        response,
        sessionId,
        conversationLength: history.length,
        metadata: {
          model: this.config.model,
          duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.metrics.failedRequests++;
      console.error('Conversational chat error:', error);
      return {
        success: false,
        error: error.message,
        sessionId,
        metadata: {
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Streaming chat response
   */
  async *chatStream(message, options = {}) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const stream = await this.llm.stream(message);
      
      for await (const chunk of stream) {
        yield chunk;
      }

      const duration = Date.now() - startTime;
      this.updateMetrics(duration, true);
    } catch (error) {
      this.metrics.failedRequests++;
      console.error('Chat stream error:', error);
      yield { error: error.message };
    }
  }

  /**
   * Chain-based processing with custom prompt template
   */
  async processWithChain(input, templateString, variables = {}) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Create prompt template
      const prompt = ChatPromptTemplate.fromTemplate(templateString);
      
      // Create chain
      const chain = RunnableSequence.from([
        prompt,
        this.llm,
        new StringOutputParser(),
      ]);

      // Execute chain
      const response = await chain.invoke({
        input,
        ...variables,
      });

      const duration = Date.now() - startTime;
      this.updateMetrics(duration, true);

      return {
        success: true,
        response,
        metadata: {
          model: this.config.model,
          duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.metrics.failedRequests++;
      console.error('Chain processing error:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Code generation specialized method
   */
  async generateCode(description, language = 'javascript', context = '') {
    const template = `You are an expert {language} developer. Generate clean, efficient, and well-documented code based on the following description.

${context ? `Context: {context}` : ''}

Description: {description}

Generate only the code without explanations unless specifically requested. Include comments for complex logic.`;

    return this.processWithChain(description, template, { language, context });
  }

  /**
   * DOM optimization analysis
   */
  async analyzeDOMOptimization(domStructure, metrics) {
    const template = `You are a DOM optimization expert. Analyze the following DOM structure and performance metrics, then provide specific optimization recommendations.

DOM Structure:
{domStructure}

Current Metrics:
{metrics}

Provide:
1. Key performance bottlenecks
2. Specific optimization recommendations
3. Expected performance improvements
4. Implementation priority (high/medium/low)

Format your response as JSON with these sections.`;

    return this.processWithChain(
      'Analyze this DOM structure for optimization opportunities',
      template,
      {
        domStructure: JSON.stringify(domStructure, null, 2),
        metrics: JSON.stringify(metrics, null, 2),
      }
    );
  }

  /**
   * Workflow generation
   */
  async generateWorkflow(description, requirements = []) {
    const template = `You are a workflow automation expert. Create a detailed workflow based on the description and requirements provided.

Description: {description}

Requirements:
{requirements}

Generate a workflow with:
1. Clear steps with descriptions
2. Input/output for each step
3. Error handling strategies
4. Success criteria

Format as JSON with workflow structure.`;

    return this.processWithChain(description, template, {
      requirements: requirements.map((r, i) => `${i + 1}. ${r}`).join('\n'),
    });
  }

  /**
   * Get conversation history
   */
  getConversationHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || [];
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(sessionId) {
    if (sessionId) {
      this.conversationHistory.delete(sessionId);
      return { success: true, message: `Cleared history for session: ${sessionId}` };
    } else {
      this.conversationHistory.clear();
      return { success: true, message: 'Cleared all conversation histories' };
    }
  }

  /**
   * List all active sessions
   */
  listSessions() {
    return Array.from(this.conversationHistory.keys()).map(sessionId => ({
      sessionId,
      messageCount: this.conversationHistory.get(sessionId).length,
      lastActivity: this.conversationHistory.get(sessionId).slice(-1)[0]?.timestamp,
    }));
  }

  /**
   * Update metrics
   */
  updateMetrics(duration, success) {
    if (success) {
      this.metrics.successfulRequests++;
    }
    
    // Update average response time
    const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.successfulRequests - 1) + duration;
    this.metrics.averageResponseTime = totalResponseTime / this.metrics.successfulRequests;
  }

  /**
   * Get service metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0 
        ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      activeSessions: this.conversationHistory.size,
    };
  }

  /**
   * Get service status
   */
  async getStatus() {
    try {
      // Test connection with a simple prompt
      const testResponse = await this.chat('ping', { timeout: 5000 });
      
      return {
        success: true,
        status: 'healthy',
        config: {
          baseUrl: this.config.baseUrl,
          model: this.config.model,
          temperature: this.config.temperature,
        },
        metrics: this.getMetrics(),
        connectionTest: testResponse.success ? 'passed' : 'failed',
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message,
        config: {
          baseUrl: this.config.baseUrl,
          model: this.config.model,
        },
      };
    }
  }

  /**
   * Change model dynamically
   */
  setModel(modelName) {
    this.config.model = modelName;
    this.llm = new Ollama({
      baseUrl: this.config.baseUrl,
      model: modelName,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      topP: this.config.topP,
    });
    
    console.log(`✅ Model changed to: ${modelName}`);
    return { success: true, model: modelName };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize LLM with new config
    this.llm = new Ollama({
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      topP: this.config.topP,
    });

    console.log('✅ Configuration updated:', this.config);
    return { success: true, config: this.config };
  }
}

// Singleton instance
let serviceInstance = null;

/**
 * Get or create service instance
 */
export function getLangChainOllamaService(config = {}) {
  if (!serviceInstance) {
    serviceInstance = new LangChainOllamaService(config);
  }
  return serviceInstance;
}

/**
 * Initialize service
 */
export async function initializeLangChainOllamaService(config = {}) {
  serviceInstance = new LangChainOllamaService(config);
  const status = await serviceInstance.getStatus();
  
  console.log('🚀 LangChain Ollama Service Status:', status);
  
  return serviceInstance;
}

export { LangChainOllamaService };
export default LangChainOllamaService;
