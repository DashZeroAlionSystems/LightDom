/**
 * Vector store service
 * Provides simple helpers to upsert and search embeddings using pgvector
 */

import { getDatabase } from '../config/database.js';

/**
 * Upsert an embedding record. Expects `embedding` to be an array of numbers.
 */
export async function upsertEmbedding({ docId, namespace = 'default', content = null, metadata = null, embedding }) {
  const db = getDatabase();
  if (!Array.isArray(embedding)) throw new Error('embedding must be an array of numbers');
  // Convert to vector literal string like: [0.1,0.2,...]
  const vectorStr = '[' + embedding.map((n) => Number(n)).join(',') + ']';
  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  const result = await db.query(
    `INSERT INTO embeddings (doc_id, namespace, content, metadata, embedding)
     VALUES ($1, $2, $3, $4, $5::vector)
     ON CONFLICT (doc_id, namespace) DO UPDATE
       SET content = EXCLUDED.content,
           metadata = EXCLUDED.metadata,
           embedding = EXCLUDED.embedding,
           updated_at = NOW()
     RETURNING *;`,
    [docId, namespace, content, metadataJson, vectorStr]
  );

  return result.rows[0];
}

/**
 * Search nearest neighbors for a given embedding vector.
 * embedding: number[]
 * namespace: optional string to filter by namespace
 * topK: number of neighbors to return
 */
export async function searchEmbeddings({ embedding, namespace = null, topK = 5 }) {
  const db = getDatabase();
  if (!Array.isArray(embedding)) throw new Error('embedding must be an array of numbers');
  const vectorStr = '[' + embedding.map((n) => Number(n)).join(',') + ']';

  let sql = `SELECT id, doc_id, namespace, content, metadata, embedding <-> $1::vector AS distance
             FROM embeddings`;
  const params = [vectorStr];
  if (namespace) {
    sql += ` WHERE namespace = $2`;
    params.push(namespace);
  }
  sql += ` ORDER BY embedding <-> $1::vector LIMIT ${Number(topK)}`;

  const res = await db.query(sql, params);
  return res.rows;
}

export default { upsertEmbedding, searchEmbeddings };
