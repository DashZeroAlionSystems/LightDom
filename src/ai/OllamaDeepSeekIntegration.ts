/**
 * Ollama DeepSeek Integration
 * Bidirectional streaming communication with DeepSeek via Ollama API
 * Supports tool calling, workflow creation, and real-time data mining
 */

import axios, { AxiosInstance } from 'axios';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import SchemaServiceFactory, { ServiceSchema } from '../services/SchemaServiceFactory';

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
  private schemaService: SchemaServiceFactory;

  constructor(config?: Partial<OllamaConfig>) {
    super();
    this.config = {
      endpoint: config?.endpoint || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
      model: config?.model || process.env.OLLAMA_MODEL || 'deepseek-r1:latest',
      temperature: config?.temperature ?? 0.7,
      streamingEnabled: config?.streamingEnabled !== false,
      toolsEnabled: config?.toolsEnabled !== false,
    };

    this.client = axios.create({
      baseURL: this.config.endpoint,
      timeout: 300000, // 5 minutes for long responses
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.schemaService = new SchemaServiceFactory();
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

      // Initialize schema service
      await this.schemaService.initialize();

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
   * Test Ollama connection and start services if needed
   */
  private async testConnection(): Promise<void> {
    try {
      const response = await this.client.get('/api/tags');
      if (response.status === 200) {
        console.log('✅ Ollama API connection successful');
        const models = response.data.models || [];
        const hasDeepSeek = models.some((m: any) => m.name.includes('deepseek-r1'));
        if (!hasDeepSeek) {
          console.log('📥 DeepSeek-R1 model not found. Pulling...');
          await this.pullModel('deepseek-r1:latest');
        } else {
          console.log('✅ DeepSeek-R1 model available');
        }
      }
    } catch (error: any) {
      console.log('⚠️ Ollama not running. Attempting to start...');
      await this.startOllama();
      // Retry connection after starting
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.testConnection();
    }
  }

  /**
   * Start Ollama server
   */
  private async startOllama(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting Ollama server...');

      const ollamaProcess = spawn('ollama', ['serve'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
      });

      let started = false;
      let timeout = setTimeout(() => {
        if (!started) {
          started = true;
          ollamaProcess.kill();
          reject(new Error('Ollama failed to start within timeout'));
        }
      }, 10000);

      ollamaProcess.on('error', error => {
        if (!started) {
          started = true;
          clearTimeout(timeout);
          reject(error);
        }
      });

      // Listen for output to confirm server is running
      ollamaProcess.stdout.on('data', data => {
        const output = data.toString();
        if (
          output.includes('listening') ||
          output.includes('ready') ||
          output.includes('server started')
        ) {
          if (!started) {
            started = true;
            clearTimeout(timeout);
            console.log('✅ Ollama server started successfully');
            // Don't kill the process, let it run in background
            ollamaProcess.unref();
            resolve();
          }
        }
      });

      ollamaProcess.stderr.on('data', data => {
        const output = data.toString();
        if (
          output.includes('listening') ||
          output.includes('ready') ||
          output.includes('server started')
        ) {
          if (!started) {
            started = true;
            clearTimeout(timeout);
            console.log('✅ Ollama server started successfully');
            ollamaProcess.unref();
            resolve();
          }
        }
      });
    });
  }

  /**
   * Pull a model from Ollama
   */
  private async pullModel(modelName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`📥 Pulling model: ${modelName}`);

      const pullProcess = spawn('ollama', ['pull', modelName], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      pullProcess.on('close', code => {
        if (code === 0) {
          console.log(`✅ Successfully pulled model: ${modelName}`);
          resolve();
        } else {
          reject(new Error(`Failed to pull model ${modelName} (exit code: ${code})`));
        }
      });

      pullProcess.on('error', error => {
        reject(new Error(`Failed to pull model ${modelName}: ${error.message}`));
      });
    });
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
    this.registerTool(
      {
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
                items: { type: 'object' },
              },
              rules: {
                type: 'array',
                description: 'Array of workflow rules',
                items: { type: 'object' },
              },
            },
            required: ['name', 'steps'],
          },
        },
      },
      this.handleCreateWorkflow.bind(this)
    );

    // Data query tool
    this.registerTool(
      {
        type: 'function',
        function: {
          name: 'query_database',
          description: 'Query the database for workflow data, configurations, or analytics',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'SQL query or data request' },
              table: { type: 'string', description: 'Table name to query' },
              filters: { type: 'object', description: 'Filter conditions' },
            },
            required: ['table'],
          },
        },
      },
      this.handleDatabaseQuery.bind(this)
    );

    // Data mining campaign tool
    this.registerTool(
      {
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
                items: { type: 'string' },
              },
              dataStreams: {
                type: 'array',
                description: 'Real-time data stream IDs',
                items: { type: 'string' },
              },
            },
            required: ['workflowId', 'name', 'attributes'],
          },
        },
      },
      this.handleCreateDataMiningCampaign.bind(this)
    );

    // Visual component tool
    this.registerTool(
      {
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
                enum: ['chart', 'form', 'table', 'editor', 'dashboard'],
              },
              config: { type: 'object', description: 'Component configuration' },
            },
            required: ['workflowId', 'componentType'],
          },
        },
      },
      this.handleAddWorkflowComponent.bind(this)
    );
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
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: initialMessage,
    });

    const stream: BidiStream = {
      id: streamId,
      messages,
      onChunk: chunk => this.emit('chunk', { streamId, chunk }),
      onComplete: response => this.emit('complete', { streamId, response }),
      onError: error => this.emit('error', { streamId, error }),
      active: true,
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
      content: message,
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
          temperature: this.config.temperature,
        },
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
      responseType: 'stream',
    });

    let fullContent = '';
    let toolCalls: ToolCall[] = [];

    response.data.on('data', (chunk: Buffer) => {
      const lines = chunk
        .toString()
        .split('\n')
        .filter(line => line.trim());

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
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
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
              tool_call_id: toolCall.id,
            };

            stream.messages.push(toolMessage);
            history.push(toolMessage);
          } catch (error: any) {
            console.error(`Error executing tool ${toolCall.function.name}:`, error);
            const errorMessage: Message = {
              role: 'tool',
              content: JSON.stringify({ error: error.message }),
              tool_call_id: toolCall.id,
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
      created: new Date().toISOString(),
    };

    // Create schema for the workflow action
    const workflowSchema: ServiceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Action',
      '@id': `lightdom:action-workflow-${workflow.id}`,
      name: `Workflow Creation: ${args.name}`,
      description: `Created workflow "${args.name}" with ${args.steps?.length || 0} steps`,
      'lightdom:serviceType': 'background',
      'lightdom:config': {
        queue: {
          type: 'memory',
          concurrency: 1,
          retries: 0,
          timeout: 30000,
        },
      },
      'lightdom:linkedServices': [],
      'lightdom:tasks': [
        {
          id: 'create-workflow',
          type: 'workflow-creation',
          description: `Create workflow with name: ${args.name}`,
          enabled: true,
        },
      ],
      'lightdom:enabled': true,
      'lightdom:autoStart': false,
      'lightdom:priority': 5,
    };

    // Save the schema
    await this.schemaService.saveSchema(workflowSchema);

    // Emit event for workflow creation
    this.emit('workflowCreated', workflow);

    return {
      success: true,
      workflowId: workflow.id,
      schemaId: workflowSchema['@id'],
      message: `Workflow "${args.name}" created successfully`,
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
        { id: 2, data: 'Sample data 2' },
      ],
    };

    // Create schema for the database query action
    const querySchema: ServiceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Action',
      '@id': `lightdom:action-query-${Date.now()}`,
      name: `Database Query: ${args.table}`,
      description: `Queried table "${args.table}" with filters: ${JSON.stringify(args.filters || {})}`,
      'lightdom:serviceType': 'api',
      'lightdom:config': {
        api: {
          port: 3001,
          cors: true,
          rateLimit: {
            windowMs: 60000,
            max: 10,
          },
        },
      },
      'lightdom:linkedServices': [],
      'lightdom:tasks': [
        {
          id: 'database-query',
          type: 'data-query',
          description: `Query database table: ${args.table}`,
          enabled: true,
        },
      ],
      'lightdom:enabled': true,
      'lightdom:autoStart': false,
      'lightdom:priority': 4,
    };

    // Save the schema
    await this.schemaService.saveSchema(querySchema);

    this.emit('databaseQueried', { table: args.table, results: mockData.results });

    return {
      ...mockData,
      schemaId: querySchema['@id'],
    };
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
      created: new Date().toISOString(),
    };

    // Create schema for the data mining campaign action
    const campaignSchema: ServiceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Action',
      '@id': `lightdom:action-campaign-${campaign.id}`,
      name: `Data Mining Campaign: ${args.name}`,
      description: `Created data mining campaign "${args.name}" for workflow ${args.workflowId} with ${args.attributes?.length || 0} attributes`,
      'lightdom:serviceType': 'worker',
      'lightdom:config': {
        workers: {
          type: 'node',
          count: 2,
          pooling: true,
          strategy: 'least-busy',
        },
        queue: {
          type: 'redis',
          concurrency: 5,
          retries: 2,
          timeout: 120000,
        },
      },
      'lightdom:linkedServices': [args.workflowId],
      'lightdom:tasks': [
        {
          id: 'data-mining-campaign',
          type: 'data-mining',
          description: `Mine data for attributes: ${args.attributes?.join(', ') || 'none'}`,
          enabled: true,
        },
      ],
      'lightdom:enabled': true,
      'lightdom:autoStart': false,
      'lightdom:priority': 6,
    };

    // Save the schema
    await this.schemaService.saveSchema(campaignSchema);

    this.emit('dataMiningCampaignCreated', campaign);

    return {
      success: true,
      campaignId: campaign.id,
      schemaId: campaignSchema['@id'],
      message: `Data mining campaign "${args.name}" created for workflow ${args.workflowId}`,
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
      created: new Date().toISOString(),
    };

    // Create schema for the component addition action
    const componentSchema: ServiceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Action',
      '@id': `lightdom:action-component-${component.id}`,
      name: `Component Addition: ${args.componentType}`,
      description: `Added ${args.componentType} component to workflow ${args.workflowId}`,
      'lightdom:serviceType': 'api',
      'lightdom:config': {
        api: {
          port: 3001,
          cors: true,
          rateLimit: {
            windowMs: 60000,
            max: 20,
          },
        },
      },
      'lightdom:linkedServices': [args.workflowId],
      'lightdom:tasks': [
        {
          id: 'add-component',
          type: 'component-addition',
          description: `Add ${args.componentType} component to workflow`,
          enabled: true,
        },
      ],
      'lightdom:enabled': true,
      'lightdom:autoStart': false,
      'lightdom:priority': 3,
    };

    // Save the schema
    await this.schemaService.saveSchema(componentSchema);

    this.emit('workflowComponentAdded', component);

    return {
      success: true,
      componentId: component.id,
      schemaId: componentSchema['@id'],
      message: `${args.componentType} component added to workflow ${args.workflowId}`,
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
        content: message,
      });

      const stream: BidiStream = {
        id: convId,
        messages: existingHistory,
        onChunk: chunk => {
          fullResponse += chunk;
        },
        onComplete: response => {
          resolve(response);
        },
        onError: error => {
          reject(error);
        },
        active: true,
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
   * Generate text from a prompt (simpler than chat, no history)
   */
  async generate(prompt: string, options: any = {}): Promise<string> {
    try {
      const response = await this.client.post('/api/generate', {
        model: this.config.model,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature ?? this.config.temperature,
          top_p: options.top_p ?? 0.9,
          num_predict: options.max_tokens,
        },
      });

      return response.data.response || '';
    } catch (error: any) {
      console.error('Generate error:', error.message);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
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
      toolsEnabled: this.config.toolsEnabled,
    };
  }
}

export default OllamaDeepSeekIntegration;
