/**
 * Enhanced RAG Service with ORC (Ollama Remote Chat) Integration
 * Provides comprehensive RAG functionality with DeepSeek tools and computer use
 */

import createRagService from './rag-service.js';
import { deepseekTools } from './deepseek-tools.js';
import { systemPrompts, buildPrompt, responseFormatters } from './prompt-templates.js';
import createVectorStore from './vector-store.js';
import createDeepSeekClient from './deepseek-client.js';
import createOllamaEmbeddingClient from './ollama-embedding-client.js';
import createEmbeddingClient from './openai-embedding-client.js';

/**
 * Enhanced RAG Service Factory
 */
export function createEnhancedRagService({ db, logger = console, config = {} } = {}) {
  if (!db) {
    throw new Error('Enhanced RAG service requires a database connection');
  }

  // Initialize base RAG service
  const vectorStore = createVectorStore(db, { logger });
  
  const embeddingClient = config.useOllamaEmbeddings 
    ? createOllamaEmbeddingClient(config.ollama || {})
    : createEmbeddingClient(config.openai || {});
  
  const deepseekClient = createDeepSeekClient(config.deepseek || {});
  
  const baseRag = createRagService({
    vectorStore,
    embeddingClient,
    deepseekClient,
    logger
  });

  /**
   * Conversation state management
   */
  const conversations = new Map();

  /**
   * Tool execution with safety checks
   */
  async function executeTool(toolName, params, conversationId) {
    logger.info(`Executing tool: ${toolName}`, { params, conversationId });

    try {
      // Parse tool name (e.g., "git.status" -> ["git", "status"])
      const parts = toolName.split('.');
      let tool = deepseekTools;
      
      for (const part of parts) {
        tool = tool[part];
        if (!tool) {
          throw new Error(`Tool not found: ${toolName}`);
        }
      }

      // Execute tool
      if (typeof tool !== 'function') {
        throw new Error(`Invalid tool: ${toolName} is not a function`);
      }

      const result = await tool(params);
      
      // Store execution in conversation history
      const conversation = conversations.get(conversationId) || { tools: [] };
      conversation.tools.push({
        tool: toolName,
        params,
        result,
        timestamp: new Date().toISOString()
      });
      conversations.set(conversationId, conversation);

      return result;
    } catch (error) {
      logger.error(`Tool execution failed: ${toolName}`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse tool calls from AI response
   */
  function parseToolCalls(text) {
    const toolCalls = [];
    
    // Look for tool call patterns like: TOOL:git.status or EXECUTE:command:npm start
    const patterns = [
      /TOOL:(\w+(?:\.\w+)*)\((.*?)\)/g,
      /EXECUTE:(\w+(?:\.\w+)*):(.+?)(?:\n|$)/g,
      /\[TOOL:(\w+(?:\.\w+)*)\]\((.*?)\)/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        try {
          const toolName = match[1];
          const paramsStr = match[2];
          let params;
          
          try {
            params = JSON.parse(paramsStr);
          } catch {
            // If not JSON, treat as plain string
            params = paramsStr.trim();
          }
          
          toolCalls.push({ toolName, params });
        } catch (error) {
          logger.warn('Failed to parse tool call', { match: match[0], error: error.message });
        }
      }
    }

    return toolCalls;
  }

  /**
   * Enhanced chat with tool support
   */
  async function* chatWithTools(messages, options = {}) {
    const {
      conversationId = 'default',
      mode = 'assistant',
      enableTools = true,
      maxToolCalls = 5,
      temperature = 0.7,
      maxTokens = 2048
    } = options;

    // Get or create conversation
    let conversation = conversations.get(conversationId) || {
      messages: [],
      tools: [],
      context: {}
    };

    // Add system prompt based on mode
    const systemMessage = {
      role: 'system',
      content: systemPrompts[mode] || systemPrompts.assistant
    };

    // Build full message history
    const fullMessages = [systemMessage, ...conversation.messages, ...messages];

    // Add tool documentation if tools are enabled
    if (enableTools) {
      const toolDoc = buildToolDocumentation();
      fullMessages.splice(1, 0, {
        role: 'system',
        content: `AVAILABLE TOOLS:\n${toolDoc}\n\nTo use a tool, include: TOOL:toolName({"param": "value"})`
      });
    }

    // Stream chat response
    const { stream, retrieved } = await baseRag.streamChat(fullMessages, {
      temperature,
      maxTokens,
      ...options
    });

    let fullResponse = '';
    let toolCallCount = 0;

    // Process stream
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        yield {
          type: 'chunk',
          content: chunk,
          conversationId
        };

        // Check for tool calls
        if (enableTools && fullResponse.includes('TOOL:')) {
          const toolCalls = parseToolCalls(fullResponse);
          
          for (const { toolName, params } of toolCalls) {
            if (toolCallCount >= maxToolCalls) {
              yield {
                type: 'warning',
                content: 'Maximum tool calls reached',
                conversationId
              };
              break;
            }

            yield {
              type: 'tool_call',
              tool: toolName,
              params,
              conversationId
            };

            const result = await executeTool(toolName, params, conversationId);
            
            yield {
              type: 'tool_result',
              tool: toolName,
              result,
              conversationId
            };

            toolCallCount++;

            // Continue conversation with tool result
            const toolResultMessage = {
              role: 'system',
              content: `Tool ${toolName} result:\n${JSON.stringify(result, null, 2)}`
            };

            fullMessages.push({ role: 'assistant', content: fullResponse });
            fullMessages.push(toolResultMessage);

            // Get next response
            const followUp = await baseRag.streamChat(fullMessages, {
              temperature,
              maxTokens: maxTokens / 2
            });

            const followUpReader = followUp.stream.getReader();
            let followUpResponse = '';

            while (true) {
              const { done, value } = await followUpReader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              followUpResponse += chunk;

              yield {
                type: 'chunk',
                content: chunk,
                conversationId
              };
            }

            fullResponse += followUpResponse;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Update conversation
    conversation.messages.push(
      ...messages,
      { role: 'assistant', content: fullResponse }
    );
    conversations.set(conversationId, conversation);

    yield {
      type: 'done',
      conversationId,
      retrieved
    };
  }

  /**
   * Build tool documentation
   */
  function buildToolDocumentation() {
    return `
1. Git Operations
   - TOOL:git.status() - Get repository status
   - TOOL:git.commit({"message": "commit message"}) - Commit changes
   - TOOL:git.push() - Push to remote
   - TOOL:git.createBranch({"branchName": "feature/name"}) - Create branch
   - TOOL:git.diff({"files": "optional"}) - View changes

2. File Operations
   - TOOL:file.read({"filePath": "/path/to/file"}) - Read file
   - TOOL:file.write({"filePath": "/path", "content": "..."}) - Write file
   - TOOL:file.list({"dirPath": "/path"}) - List directory
   - TOOL:file.mkdir({"dirPath": "/path"}) - Create directory

3. Project Management
   - TOOL:project.start() - Start the project
   - TOOL:project.build() - Build the project
   - TOOL:project.test() - Run tests
   - TOOL:project.installDependencies() - Install dependencies
   - TOOL:project.getInfo() - Get project information

4. System Operations
   - TOOL:system.getInfo() - Get system information
   - TOOL:command({"command": "safe command"}) - Execute safe command

Use tools to help users accomplish tasks. Always explain what you're doing.
`;
  }

  /**
   * Get conversation history
   */
  function getConversation(conversationId) {
    return conversations.get(conversationId) || null;
  }

  /**
   * Clear conversation
   */
  function clearConversation(conversationId) {
    conversations.delete(conversationId);
  }

  /**
   * List all conversations
   */
  function listConversations() {
    return Array.from(conversations.keys());
  }

  /**
   * Execute command directly
   */
  async function executeCommand(command, options = {}) {
    return deepseekTools.command(command, options);
  }

  /**
   * Index codebase for RAG
   */
  async function indexCodebase(projectPath, options = {}) {
    const { patterns = ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.jsx'], exclude = ['node_modules', 'dist', '.git'] } = options;
    
    logger.info('Indexing codebase', { projectPath, patterns });

    const documents = [];
    
    // Read files matching patterns
    const files = await deepseekTools.file.list(projectPath);
    
    if (!files.success) {
      throw new Error(`Failed to list files: ${files.error}`);
    }

    for (const entry of files.entries) {
      if (entry.type === 'file' && !exclude.some(ex => entry.path.includes(ex))) {
        const content = await deepseekTools.file.read(entry.path);
        
        if (content.success) {
          documents.push({
            id: entry.path,
            title: entry.name,
            content: content.content,
            metadata: {
              type: 'code',
              path: entry.path,
              language: entry.name.split('.').pop()
            }
          });
        }
      }
    }

    // Upsert to vector store
    const result = await baseRag.upsertDocuments(documents);
    
    logger.info('Codebase indexed', result);
    
    return result;
  }

  /**
   * Health check
   */
  async function healthCheck() {
    const baseHealth = await baseRag.healthCheck();
    
    return {
      ...baseHealth,
      tools: {
        status: 'ok',
        available: Object.keys(deepseekTools).length
      },
      conversations: {
        active: conversations.size
      }
    };
  }

  return {
    // Base RAG methods
    ...baseRag,
    
    // Enhanced methods
    chatWithTools,
    executeTool,
    executeCommand,
    
    // Conversation management
    getConversation,
    clearConversation,
    listConversations,
    
    // Codebase indexing
    indexCodebase,
    
    // Health
    healthCheck,
    
    // Tools access
    tools: deepseekTools
  };
}

export default createEnhancedRagService;
