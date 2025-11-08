import { successResponse } from '../utils/response.js';
import * as vectorStore from '../../services/vector-store.js';

/**
 * Upsert an embedding via API
 */
export const upsert = async (req, res) => {
  const { docId, namespace, content, metadata, embedding } = req.body;
  if (!embedding) throw new Error('embedding is required');

  const row = await vectorStore.upsertEmbedding({ docId, namespace, content, metadata, embedding });
  successResponse(res, row, 'Embedding upserted');
};

/**
 * Search embeddings API
 */
export const search = async (req, res) => {
  const { embedding, namespace, topK = 5 } = req.body;
  if (!embedding) throw new Error('embedding is required');

  const rows = await vectorStore.searchEmbeddings({ embedding, namespace, topK });
  successResponse(res, rows, 'Search results');
};

export default { upsert, search };
