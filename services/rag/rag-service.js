import crypto from 'crypto';

function defaultChunker(text, options = {}) {
  const chunkSize = options.chunkSize || Number.parseInt(process.env.RAG_CHUNK_SIZE || '800', 10);
  const overlap = options.chunkOverlap || Number.parseInt(process.env.RAG_CHUNK_OVERLAP || '120', 10);
  const trimmed = text.replace(/\r\n/g, '\n');
  const paragraphs = trimmed.split(/\n{2,}/);

  const chunks = [];
  let buffer = '';
  let index = 0;

  const emitChunk = (content) => {
    const chunkContent = content.trim();
    if (!chunkContent) return;
    const id = crypto.randomUUID();
    chunks.push({
      id,
      index,
      content: chunkContent,
    });
    index += 1;
  };

  for (const paragraph of paragraphs) {
    if ((buffer + '\n\n' + paragraph).length <= chunkSize) {
      buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
      continue;
    }

    if (buffer) {
      emitChunk(buffer);
      if (overlap > 0) {
        buffer = buffer.slice(-overlap) + '\n\n' + paragraph;
      } else {
        buffer = paragraph;
      }
    } else {
      buffer = paragraph;
    }

    while (buffer.length > chunkSize) {
      emitChunk(buffer.slice(0, chunkSize));
      buffer = buffer.slice(chunkSize - overlap);
    }
  }

  if (buffer) {
    emitChunk(buffer);
  }

  return chunks;
}

export default function createRagService({
  vectorStore,
  embeddingClient,
  deepseekClient,
  logger = console,
  chunker = defaultChunker,
} = {}) {
  if (!vectorStore) throw new Error('vectorStore is required');
  if (!embeddingClient) throw new Error('embeddingClient is required');
  if (!deepseekClient) throw new Error('deepseekClient is required');

  async function ensureReady() {
    if (vectorStore.init) {
      await vectorStore.init();
    }
  }

  async function embedTexts(texts) {
    if (!Array.isArray(texts) || texts.length === 0) return [];
    return embeddingClient.embed(texts);
  }

  async function upsertDocuments(documents = [], options = {}) {
    await ensureReady();

    const prepared = [];

    for (const document of documents) {
      const { id: documentId, title, content, metadata = {} } = document;
      if (!documentId || !content) {
        throw new Error('Each document requires id and content');
      }

      const chunks = chunker(content, options).map((chunk) => ({
        ...chunk,
        metadata: {
          title,
          ...(metadata || {}),
        },
      }));

      const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));

      const enrichedChunks = chunks.map((chunk, index) => ({
        id: chunk.id,
        index: chunk.index,
        content: chunk.content,
        metadata: chunk.metadata,
        embedding: embeddings[index],
      }));

      prepared.push({ documentId, chunks: enrichedChunks });
    }

    await vectorStore.upsertDocuments(prepared);

    return {
      documents: prepared.length,
      chunks: prepared.reduce((sum, doc) => sum + doc.chunks.length, 0),
    };
  }

  async function search(query, options = {}) {
    await ensureReady();
    const [queryEmbedding] = await embedTexts([query]);
    const results = await vectorStore.search(queryEmbedding, options);
    return results;
  }

  function buildContext(results) {
    if (!results?.length) return 'No relevant documents retrieved.';
    return results
      .map((result, idx) => {
        const header = `Document ${idx + 1} (ID: ${result.documentId}, Score: ${result.score.toFixed(3)})`;
        const metadata = result.metadata ? JSON.stringify(result.metadata) : '{}';
        return `${header}\nMetadata: ${metadata}\nContent:\n${result.content}`;
      })
      .join('\n\n---\n\n');
  }

  async function streamChat(messages, options = {}) {
    await ensureReady();

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('messages array is required');
    }

    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user');
    const query = options.query || lastUserMessage?.content;

    let contextText = 'No relevant context available.';
    let retrieved = [];

    if (query) {
      retrieved = await search(query, { limit: options.topK || 5 });
      contextText = buildContext(retrieved);
    }

    const systemPrompt = options.systemPrompt ||
      'You are LightDom RAG Assistant. Use provided context to answer. Include citations like [doc-id] when possible. ' +
        'If context is insufficient, state that and provide best effort.';

    const augmentedMessages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'system',
        content: `Context documents:\n${contextText}`,
      },
      ...messages,
    ];

    const stream = await deepseekClient.streamChat(augmentedMessages, {
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });

    return { stream, retrieved };
  }

  async function generateStyleGuide(prompt, options = {}) {
    await ensureReady();
    const messages = [
      {
        role: 'system',
        content:
          'You are a design system generator. Produce a complete theme JSON with palette, typography, radii, spacing, shadows, component tokens.',
      },
      { role: 'user', content: prompt },
    ];

    const response = await deepseekClient.chat(messages, {
      temperature: options.temperature ?? 0.5,
      maxTokens: options.maxTokens ?? 1800,
      responseFormat: { type: 'json_object' },
    });

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content ?? json.message?.content;
    try {
      return JSON.parse(content);
    } catch (error) {
      logger.warn('Failed to parse style guide response, returning raw content');
      return { raw: content };
    }
  }

  async function healthCheck() {
    const report = {
      status: 'ok',
      vectorStore: {
        status: 'unknown',
        tableName: vectorStore?.tableName,
        dimension: vectorStore?.dimension,
      },
      embeddings: {
        status: 'unknown',
        provider: embeddingClient?.model || process.env.EMBEDDING_MODEL || 'unknown',
      },
      llm: {
        status: 'unknown',
        provider: deepseekClient?.model || process.env.DEEPSEEK_MODEL || 'unknown',
        isOllama: Boolean(deepseekClient?.isOllama),
      },
    };

    const raise = (level) => {
      if (level === 'error') {
        report.status = 'error';
      } else if (level === 'warn' && report.status === 'ok') {
        report.status = 'warn';
      }
    };

    try {
      await ensureReady();
      report.vectorStore.status = 'ok';
    } catch (error) {
      report.vectorStore = {
        status: 'error',
        error: error?.message || 'Vector store initialization failed',
      };
      raise('error');
    }

    try {
      await embedTexts(['LightDom RAG health check']);
      report.embeddings.status = 'ok';
    } catch (error) {
      report.embeddings = {
        status: 'error',
        error: error?.message || 'Embedding provider failed',
        provider: embeddingClient?.model || process.env.EMBEDDING_MODEL || 'unknown',
      };
      raise('error');
    }

    if (deepseekClient && typeof deepseekClient.chat === 'function') {
      if (deepseekClient.isOllama) {
        try {
          const response = await deepseekClient.chat(
            [
              { role: 'system', content: 'You are a health check endpoint. Reply with a short confirmation.' },
              { role: 'user', content: 'Return a brief acknowledgement.' },
            ],
            { maxTokens: 8 },
          );

          if (response && typeof response.arrayBuffer === 'function') {
            await response.arrayBuffer();
          }

          if (response && 'ok' in response && response.ok === false) {
            report.llm.status = 'error';
            report.llm.httpStatus = response.status;
            raise('error');
          } else {
            report.llm.status = 'ok';
            report.llm.httpStatus = response?.status;
          }
        } catch (error) {
          report.llm = {
            status: 'error',
            error: error?.message || 'DeepSeek chat health check failed',
            provider: deepseekClient?.model || process.env.DEEPSEEK_MODEL || 'unknown',
            isOllama: Boolean(deepseekClient?.isOllama),
          };
          raise('error');
        }
      } else {
        report.llm.status = 'warn';
        report.llm.reason = 'DeepSeek model is remote; skipping live chat health check to avoid token usage.';
        raise('warn');
      }
    } else {
      report.llm.status = 'error';
      report.llm.error = 'DeepSeek client is not configured';
      raise('error');
    }

    return report;
  }

  return {
    upsertDocuments,
    search,
    streamChat,
    generateStyleGuide,
    healthCheck,
  };
}
