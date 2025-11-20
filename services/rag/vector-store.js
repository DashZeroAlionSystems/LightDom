const DEFAULT_TABLE = 'rag_documents';

function toVectorLiteral(values) {
  if (!Array.isArray(values)) {
    throw new Error('Embedding must be an array of numbers');
  }
  return `[${values.join(',')}]`;
}

export default function createVectorStore(db, options = {}) {
  const tableName = options.tableName || process.env.RAG_TABLE_NAME || DEFAULT_TABLE;
  const dimension = Number.parseInt(process.env.RAG_EMBED_DIMENSION || options.dimension || '1536', 10);
  const logger = options.logger || console;

  async function ensureExtension() {
    try {
      await db.query('CREATE EXTENSION IF NOT EXISTS vector');
    } catch (error) {
      if (error.code !== '42P07') {
        logger.warn('pgvector extension check failed:', error.message);
      }
    }
  }

  async function ensureTable() {
    const ddl = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        embedding vector(${dimension}),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await db.query(ddl);

    const indexSql = `
      CREATE INDEX IF NOT EXISTS ${tableName}_embedding_idx
      ON ${tableName} USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `;

    try {
      await db.query(indexSql);
    } catch (error) {
      logger.warn('pgvector index creation skipped:', error.message);
    }
  }

  async function init() {
    await ensureExtension();
    await ensureTable();
  }

  async function upsertChunks(documentId, chunks) {
    if (!documentId) {
      throw new Error('documentId is required for upsert');
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM ${tableName} WHERE document_id = $1`, [documentId]);

      const insertSql = `
        INSERT INTO ${tableName} (id, document_id, chunk_index, content, metadata, embedding)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          document_id = EXCLUDED.document_id,
          chunk_index = EXCLUDED.chunk_index,
          content = EXCLUDED.content,
          metadata = EXCLUDED.metadata,
          embedding = EXCLUDED.embedding,
          updated_at = NOW();
      `;

      for (const chunk of chunks) {
        const id = chunk.id || `${documentId}::${chunk.index}`;
        await client.query(insertSql, [
          id,
          documentId,
          chunk.index,
          chunk.content,
          JSON.stringify(chunk.metadata || {}),
          toVectorLiteral(chunk.embedding),
        ]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async function upsertDocuments(documents) {
    for (const doc of documents) {
      await upsertChunks(doc.documentId, doc.chunks);
    }
  }

  async function search(embedding, options = {}) {
    const limit = options.limit || Number.parseInt(process.env.RAG_TOP_K || '5', 10);
    const minScore = options.minScore !== undefined ? options.minScore : Number(process.env.RAG_MIN_SCORE ?? 0);
    const metadataFilter = options.metadataFilter;

    const filters = [];
    const params = [toVectorLiteral(embedding), limit];
    let paramIndex = 3;

    if (metadataFilter && typeof metadataFilter === 'object') {
      for (const [key, value] of Object.entries(metadataFilter)) {
        filters.push(`metadata ->> $${paramIndex} = $${paramIndex + 1}`);
        params.push(key, String(value));
        paramIndex += 2;
      }
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const sql = `
      SELECT id, document_id AS "documentId", chunk_index AS "chunkIndex", content, metadata,
             1 - (embedding <=> $1) AS score
      FROM ${tableName}
      ${whereClause}
      ORDER BY embedding <-> $1
      LIMIT $2;
    `;

    const { rows } = await db.query(sql, params);
    return rows.filter((row) => row.score >= minScore);
  }

  async function deleteDocuments(documentIds) {
    const sql = `DELETE FROM ${tableName} WHERE document_id = ANY($1)`;
    await db.query(sql, [documentIds]);
  }

  return {
    init,
    upsertDocuments,
    search,
    deleteDocuments,
    tableName,
    dimension,
  };
}
