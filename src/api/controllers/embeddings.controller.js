import * as embeddingsService from '../../services/embeddings.service.js';
import * as vectorStore from '../../services/vector-store.js';
import { successResponse } from '../utils/response.js';

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

export const upsertFromText = async (req, res) => {
  const { docId, namespace, content, metadata, model = 'text-embedding-3-small' } = req.body;
  if (!content) throw new Error('content is required');

  const embedding = await embeddingsService.embedText(content, { model });
  const row = await vectorStore.upsertEmbedding({ docId, namespace, content, metadata, embedding });
  successResponse(res, row, 'Embedding created from text');
};

export default { upsert, search };
