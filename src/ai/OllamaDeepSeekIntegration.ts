/**
 * Ollama DeepSeek Integration
 * Bidirectional streaming communication with DeepSeek via Ollama API
 * Supports tool calling, workflow creation, and real-time data mining
 */

import { EventEmitter } from 'events';
import axios, { AxiosInstance } from 'axios';
import { Stream } from 'stream';

export interface OllamaConfig {
  endpoint: string;
  model: string;
  temperature: number;
  streamingEnabled: boolean;
  toolsEnabled: boolean;
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  };
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface StreamChunk {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
    tool_calls?: ToolCall[];
  };
  done: boolean;
}

export interface BidiStream {
  id: string;
  messages: Message[];
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
  active: boolean;
}

export class OllamaDeepSeekIntegration extends EventEmitter {
  private config: OllamaConfig;
  private client: AxiosInstance;
  private tools: Map<string, Tool> = new Map();
  private toolHandlers: Map<string, Function> = new Map();
  private bidiStreams: Map<string, BidiStream> = new Map();
  private conversationHistory: Map<string, Message[]> = new Map();
  private isInitialized: boolean = false;

  constructor(config?: Partial<OllamaConfig>) {
    super();
    this.config = {
      endpoint: config?.endpoint || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
      model: config?.model || process.env.OLLAMA_MODEL || 'deepseek-r1:latest',
      temperature: config?.temperature ?? 0.7,
      streamingEnabled: config?.streamingEnabled !== false,
      toolsEnabled: config?.toolsEnabled !== false
    };

    this.client = axios.create({
      baseURL: this.config.endpoint,
      timeout: 300000, // 5 minutes for long responses
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Initialize Ollama DeepSeek integration
   */
  async initialize(): Promise<void> {
    console.log('🤖 Initializing Ollama DeepSeek Integration...');
    console.log(`📍 Endpoint: ${this.config.endpoint}`);
    console.log(`🧠 Model: ${this.config.model}`);
    
    try {
      // Test connection
      await this.testConnection();
      
      // Register default tools
      await this.registerDefaultTools();
      
      this.isInitialized = true;
      this.emit('initialized');
      console.log('✅ Ollama DeepSeek Integration initialized successfully');
    } catch (error: any) {
      console.error('❌ Failed to initialize Ollama DeepSeek:', error.message);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Test Ollama connection
   */
  private async testConnection(): Promise<void> {
    try {
      const response = await this.client.get('/api/tags');
      if (response.status === 200) {
        console.log('✅ Ollama API connection successful');
        const models = response.data.models || [];
        const hasDeepSeek = models.some((m: any) => m.name.includes('deepseek'));
        if (!hasDeepSeek) {
          console.warn('⚠️ DeepSeek model not found. Pull it with: ollama pull deepseek-r1');
        }
      }
    } catch (error: any) {
      throw new Error(`Ollama connection failed: ${error.message}`);
    }
  }

  /**
   * Register a tool for DeepSeek to use
   */
  registerTool(tool: Tool, handler: Function): void {
    this.tools.set(tool.function.name, tool);
    this.toolHandlers.set(tool.function.name, handler);
    console.log(`🔧 Registered tool: ${tool.function.name}`);
  }

  /**
   * Register default tools
   */
  private async registerDefaultTools(): Promise<void> {
    // Workflow creation tool
    this.registerTool({
      type: 'function',
      function: {
        name: 'create_workflow',
        description: 'Create a new workflow with steps, rules, and triggers',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Workflow name' },
            description: { type: 'string', description: 'Workflow description' },
            steps: { 
              type: 'array', 
              description: 'Array of workflow steps',
              items: { type: 'object' }
            },
            rules: {
              type: 'array',
              description: 'Array of workflow rules',
              items: { type: 'object' }
            }
          },
          required: ['name', 'steps']
        }
      }
    }, this.handleCreateWorkflow.bind(this));

    // Data query tool
    this.registerTool({
      type: 'function',
      function: {
        name: 'query_database',
        description: 'Query the database for workflow data, configurations, or analytics',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'SQL query or data request' },
            table: { type: 'string', description: 'Table name to query' },
            filters: { type: 'object', description: 'Filter conditions' }
          },
          required: ['table']
        }
      }
    }, this.handleDatabaseQuery.bind(this));

    // Data mining campaign tool
    this.registerTool({
      type: 'function',
      function: {
        name: 'create_data_mining_campaign',
        description: 'Create a data mining campaign attached to a workflow',
        parameters: {
          type: 'object',
          properties: {
            workflowId: { type: 'string', description: 'Associated workflow ID' },
            name: { type: 'string', description: 'Campaign name' },
            attributes: { 
              type: 'array', 
              description: 'Attributes to mine',
              items: { type: 'string' }
            },
            dataStreams: {
              type: 'array',
              description: 'Real-time data stream IDs',
              items: { type: 'string' }
            }
          },
          required: ['workflowId', 'name', 'attributes']
        }
      }
    }, this.handleCreateDataMiningCampaign.bind(this));

    // Visual component tool
    this.registerTool({
      type: 'function',
      function: {
        name: 'add_workflow_component',
        description: 'Add a visual component to a workflow for data display or editing',
        parameters: {
          type: 'object',
          properties: {
            workflowId: { type: 'string', description: 'Workflow ID' },
            componentType: { 
              type: 'string', 
              description: 'Component type (chart, form, table, editor)',
              enum: ['chart', 'form', 'table', 'editor', 'dashboard']
            },
            config: { type: 'object', description: 'Component configuration' }
          },
          required: ['workflowId', 'componentType']
        }
      }
    }, this.handleAddWorkflowComponent.bind(this));
  }

  /**
   * Start a bidirectional conversation stream
   */
  async startBidiStream(
    streamId: string,
    initialMessage: string,
    systemPrompt?: string
  ): Promise<void> {
    const messages: Message[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    messages.push({
      role: 'user',
      content: initialMessage
    });

    const stream: BidiStream = {
      id: streamId,
      messages,
      onChunk: (chunk) => this.emit('chunk', { streamId, chunk }),
      onComplete: (response) => this.emit('complete', { streamId, response }),
      onError: (error) => this.emit('error', { streamId, error }),
      active: true
    };

    this.bidiStreams.set(streamId, stream);
    this.conversationHistory.set(streamId, messages);

    await this.processStream(streamId);
  }

  /**
   * Send a message to an active stream
   */
  async sendToStream(streamId: string, message: string): Promise<void> {
    const stream = this.bidiStreams.get(streamId);
    if (!stream || !stream.active) {
      throw new Error(`Stream ${streamId} is not active`);
    }

    const userMessage: Message = {
      role: 'user',
      content: message
    };

    stream.messages.push(userMessage);
    const history = this.conversationHistory.get(streamId) || [];
    history.push(userMessage);
    this.conversationHistory.set(streamId, history);

    await this.processStream(streamId);
  }

  /**
   * Process stream with tool calling support
   */
  private async processStream(streamId: string): Promise<void> {
    const stream = this.bidiStreams.get(streamId);
    if (!stream) return;

    try {
      const requestData: any = {
        model: this.config.model,
        messages: stream.messages,
        stream: this.config.streamingEnabled,
        options: {
          temperature: this.config.temperature
        }
      };

      // Add tools if enabled
      if (this.config.toolsEnabled && this.tools.size > 0) {
        requestData.tools = Array.from(this.tools.values());
      }

      if (this.config.streamingEnabled) {
        await this.handleStreamingResponse(streamId, requestData);
      } else {
        await this.handleNonStreamingResponse(streamId, requestData);
      }
    } catch (error: any) {
      stream.onError(error);
      this.emit('streamError', { streamId, error });
    }
  }

  /**
   * Handle streaming response
   */
  private async handleStreamingResponse(streamId: string, requestData: any): Promise<void> {
    const stream = this.bidiStreams.get(streamId);
    if (!stream) return;

    const response = await this.client.post('/api/chat', requestData, {
      responseType: 'stream'
    });

    let fullContent = '';
    let toolCalls: ToolCall[] = [];

    response.data.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data: StreamChunk = JSON.parse(line);
          
          if (data.message.content) {
            fullContent += data.message.content;
            stream.onChunk(data.message.content);
          }

          if (data.message.tool_calls) {
            toolCalls.push(...data.message.tool_calls);
          }

          if (data.done) {
            this.handleStreamComplete(streamId, fullContent, toolCalls);
          }
        } catch (e) {
          // Ignore JSON parse errors for incomplete chunks
        }
      }
    });

    response.data.on('error', (error: Error) => {
      stream.onError(error);
    });
  }

  /**
   * Handle non-streaming response
   */
  private async handleNonStreamingResponse(streamId: string, requestData: any): Promise<void> {
    const stream = this.bidiStreams.get(streamId);
    if (!stream) return;

    const response = await this.client.post('/api/chat', requestData);
    const message = response.data.message;

    if (message.content) {
      stream.onChunk(message.content);
    }

    await this.handleStreamComplete(streamId, message.content, message.tool_calls || []);
  }

  /**
   * Handle stream completion and tool calls
   */
  private async handleStreamComplete(
    streamId: string,
    content: string,
    toolCalls: ToolCall[]
  ): Promise<void> {
    const stream = this.bidiStreams.get(streamId);
    if (!stream) return;

    // Add assistant message to history
    const assistantMessage: Message = {
      role: 'assistant',
      content,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined
    };

    stream.messages.push(assistantMessage);
    const history = this.conversationHistory.get(streamId) || [];
    history.push(assistantMessage);

    // Process tool calls if any
    if (toolCalls.length > 0) {
      console.log(`🔧 Processing ${toolCalls.length} tool call(s)...`);
      
      for (const toolCall of toolCalls) {
        const handler = this.toolHandlers.get(toolCall.function.name);
        if (handler) {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await handler(args);
            
            // Add tool result to messages
            const toolMessage: Message = {
              role: 'tool',
              content: JSON.stringify(result),
              tool_call_id: toolCall.id
            };
            
            stream.messages.push(toolMessage);
            history.push(toolMessage);
          } catch (error: any) {
            console.error(`Error executing tool ${toolCall.function.name}:`, error);
            const errorMessage: Message = {
              role: 'tool',
              content: JSON.stringify({ error: error.message }),
              tool_call_id: toolCall.id
            };
            stream.messages.push(errorMessage);
            history.push(errorMessage);
          }
        }
      }

      this.conversationHistory.set(streamId, history);
      
      // Continue conversation after tool execution
      await this.processStream(streamId);
    } else {
      // No tool calls, stream is complete
      stream.onComplete(content);
      this.emit('streamComplete', { streamId, content });
    }
  }

  /**
   * Tool handler: Create workflow
   */
  private async handleCreateWorkflow(args: any): Promise<any> {
    console.log('📝 Creating workflow:', args.name);
    
    // This would integrate with your workflow management system
    const workflow = {
      id: `workflow-${Date.now()}`,
      name: args.name,
      description: args.description,
      steps: args.steps,
      rules: args.rules || [],
      created: new Date().toISOString()
    };

    // Emit event for workflow creation
    this.emit('workflowCreated', workflow);

    return {
      success: true,
      workflowId: workflow.id,
      message: `Workflow "${args.name}" created successfully`
    };
  }

  /**
   * Tool handler: Database query
   */
  private async handleDatabaseQuery(args: any): Promise<any> {
    console.log('🔍 Querying database:', args.table);
    
    // This would integrate with your database
    // For now, return mock data
    const mockData = {
      table: args.table,
      filters: args.filters,
      results: [
        { id: 1, data: 'Sample data 1' },
        { id: 2, data: 'Sample data 2' }
      ]
    };

    this.emit('databaseQueried', { table: args.table, results: mockData.results });

    return mockData;
  }

  /**
   * Tool handler: Create data mining campaign
   */
  private async handleCreateDataMiningCampaign(args: any): Promise<any> {
    console.log('⛏️ Creating data mining campaign:', args.name);
    
    const campaign = {
      id: `campaign-${Date.now()}`,
      workflowId: args.workflowId,
      name: args.name,
      attributes: args.attributes,
      dataStreams: args.dataStreams || [],
      status: 'active',
      created: new Date().toISOString()
    };

    this.emit('dataMiningCampaignCreated', campaign);

    return {
      success: true,
      campaignId: campaign.id,
      message: `Data mining campaign "${args.name}" created for workflow ${args.workflowId}`
    };
  }

  /**
   * Tool handler: Add workflow component
   */
  private async handleAddWorkflowComponent(args: any): Promise<any> {
    console.log('🎨 Adding component to workflow:', args.workflowId);
    
    const component = {
      id: `component-${Date.now()}`,
      workflowId: args.workflowId,
      type: args.componentType,
      config: args.config || {},
      created: new Date().toISOString()
    };

    this.emit('workflowComponentAdded', component);

    return {
      success: true,
      componentId: component.id,
      message: `${args.componentType} component added to workflow ${args.workflowId}`
    };
  }

  /**
   * Chat with DeepSeek (simple interface)
   */
  async chat(message: string, conversationId?: string): Promise<string> {
    const convId = conversationId || `conv-${Date.now()}`;
    
    return new Promise((resolve, reject) => {
      let fullResponse = '';
      
      const existingHistory = this.conversationHistory.get(convId) || [];
      existingHistory.push({
        role: 'user',
        content: message
      });

      const stream: BidiStream = {
        id: convId,
        messages: existingHistory,
        onChunk: (chunk) => {
          fullResponse += chunk;
        },
        onComplete: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        },
        active: true
      };

      this.bidiStreams.set(convId, stream);
      this.conversationHistory.set(convId, existingHistory);

      this.processStream(convId).catch(reject);
    });
  }

  /**
   * Stop a bidirectional stream
   */
  stopStream(streamId: string): void {
    const stream = this.bidiStreams.get(streamId);
    if (stream) {
      stream.active = false;
      this.bidiStreams.delete(streamId);
      console.log(`🛑 Stopped stream: ${streamId}`);
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(conversationId: string): Message[] {
    return this.conversationHistory.get(conversationId) || [];
  }

  /**
   * Clear conversation history
   */
  clearConversation(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
    console.log(`🗑️ Cleared conversation: ${conversationId}`);
  }

  /**
   * Get status
   */
  getStatus(): any {
    return {
      initialized: this.isInitialized,
      endpoint: this.config.endpoint,
      model: this.config.model,
      toolsRegistered: this.tools.size,
      activeStreams: this.bidiStreams.size,
      conversations: this.conversationHistory.size,
      streamingEnabled: this.config.streamingEnabled,
      toolsEnabled: this.config.toolsEnabled
    };
  }
}

export default OllamaDeepSeekIntegration;
