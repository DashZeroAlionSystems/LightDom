/**
 * RAG MCP Tools
 * 
 * MCP tools for Ollama to interact with the RAG system.
 * These tools allow the LLM to:
 * - Search for relevant documents
 * - Index new documents
 * - Get RAG system status
 * 
 * @module services/rag/rag-mcp-tools
 */

/**
 * RAG MCP Tool Definitions
 */
export const ragMcpTools = [
  {
    name: 'rag_search',
    description: 'Search for relevant documents in the RAG knowledge base. Use this to find context for answering questions.',
    category: 'rag',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to find relevant documents',
        },
        namespace: {
          type: 'string',
          default: 'default',
          description: 'The document namespace to search in',
        },
        topK: {
          type: 'number',
          default: 5,
          description: 'Number of results to return',
        },
      },
      required: ['query'],
    },
    permissions: ['read:rag'],
  },
  
  {
    name: 'rag_index_document',
    description: 'Index a new document into the RAG knowledge base.',
    category: 'rag',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Unique identifier for the document',
        },
        content: {
          type: 'string',
          description: 'The document content to index',
        },
        namespace: {
          type: 'string',
          default: 'default',
          description: 'The namespace to store the document in',
        },
        metadata: {
          type: 'object',
          description: 'Optional metadata for the document',
        },
      },
      required: ['id', 'content'],
    },
    permissions: ['write:rag'],
  },
  
  {
    name: 'rag_list_documents',
    description: 'List all indexed documents in the RAG knowledge base.',
    category: 'rag',
    inputSchema: {
      type: 'object',
      properties: {
        namespace: {
          type: 'string',
          default: 'default',
          description: 'The namespace to list documents from',
        },
      },
    },
    permissions: ['read:rag'],
  },
  
  {
    name: 'rag_delete_document',
    description: 'Delete a document from the RAG knowledge base.',
    category: 'rag',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The document ID to delete',
        },
        namespace: {
          type: 'string',
          default: 'default',
          description: 'The namespace the document is in',
        },
      },
      required: ['id'],
    },
    permissions: ['write:rag'],
  },
  
  {
    name: 'rag_status',
    description: 'Get the current status and statistics of the RAG system.',
    category: 'rag',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    permissions: ['read:rag'],
  },
];

/**
 * Create RAG MCP Tool Handlers
 */
export function createRagMcpHandlers(ragService) {
  return {
    rag_search: async (args) => {
      const { query, namespace = 'default', topK = 5 } = args;
      
      const result = await ragService.search(query, { namespace, topK });
      
      return {
        success: true,
        query,
        results: result.results.map(r => ({
          docId: r.docId,
          score: r.score,
          content: r.content,
          metadata: r.metadata,
        })),
        timeMs: result.timeMs,
      };
    },
    
    rag_index_document: async (args) => {
      const { id, content, namespace = 'default', metadata = {} } = args;
      
      const result = await ragService.indexDocument({
        id,
        content,
        namespace,
        metadata,
      });
      
      return {
        success: true,
        docId: result.docId,
        chunks: result.chunks,
        namespace: result.namespace,
      };
    },
    
    rag_list_documents: async (args) => {
      const { namespace = 'default' } = args;
      
      const documents = await ragService.listDocuments(namespace);
      
      return {
        success: true,
        namespace,
        count: documents.length,
        documents,
      };
    },
    
    rag_delete_document: async (args) => {
      const { id, namespace = 'default' } = args;
      
      await ragService.deleteDocument(id, namespace);
      
      return {
        success: true,
        deleted: id,
        namespace,
      };
    },
    
    rag_status: async () => {
      const [health, stats] = await Promise.all([
        ragService.healthCheck(),
        ragService.getStats(),
      ]);
      
      return {
        success: true,
        health,
        stats,
      };
    },
  };
}

/**
 * Register RAG tools with DeepSeek Tools Registry
 */
export function registerRagTools(registry, ragService) {
  const handlers = createRagMcpHandlers(ragService);
  
  for (const tool of ragMcpTools) {
    registry.registerTool({
      ...tool,
      handler: handlers[tool.name],
    });
  }
  
  console.log('[RAG MCP] Registered', ragMcpTools.length, 'tools');
}

export default {
  ragMcpTools,
  createRagMcpHandlers,
  registerRagTools,
};
