import { randomUUID } from 'crypto';
import express from 'express';
import CommerceBridgeMiner from '../../services/commerce-bridge-miner.js';
import CommerceBridgeService from '../../services/commerce-bridge-service.js';
import DeepSeekOllamaAdapter from '../../services/deepseek-ollama-adapter.js';
import TensorFlowSingletonManager from '../../services/tf-singleton.js';

export default function createMiningJobsRoutes(db) {
  const router = express.Router();
  const miner = new CommerceBridgeMiner({ db });
  const bridgeService = new CommerceBridgeService({ db });
  const tfManager = new TensorFlowSingletonManager();

  // Submit a mining job
  router.post('/jobs', async (req, res) => {
    try {
      const { clientId, topic, startUrl, config } = req.body || {};
      if (!clientId || !topic)
        return res.status(400).json({ error: 'clientId and topic required' });

      // generate a mining config via DeepSeek adapter if not provided
      const miningConfig =
        config ||
        (await DeepSeekOllamaAdapter.generateMiningConfigFromTopic(topic, {
          needs_training_data: true,
        }));

      const jobId = `mining_${randomUUID()}`;

      // for now, synchronous: enqueue by running miner in background (could be a queue job)
      (async () => {
        try {
          const target =
            miningConfig.startUrl ||
            startUrl ||
            `https://www.google.com/search?q=${encodeURIComponent(topic)}`;
          const r = await miner.createBridgeStoreFromSite(clientId, target, {
            bridgeName: `AutoStore ${topic}`,
            paymentConfig: null,
          });
          // if the job requested training data, create a TF instance and queue training
          if (miningConfig.needs_training_data && r && r.store) {
            const instId = `tf_${jobId}`;
            await tfManager.createInstance(instId, { schema: miningConfig.attributes || [] });
            // naive training data payload: product vectors or features could be derived here
            await tfManager.train(instId, { xs: [[0]], ys: [[0]], epochs: 1 });
          }
        } catch (e) {
          console.warn('Mining background task failed', e?.message || e);
        }
      })();

      res.json({ ok: true, jobId, config: miningConfig });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Get job status (stub)
  router.get('/jobs/:id', async (req, res) => {
    const jobId = req.params.id;
    res.json({ ok: true, jobId, status: 'queued' });
  });

  // List bridges/stores for client
  router.get('/stores/:clientId', async (req, res) => {
    const clientId = req.params.clientId;
    // naive: query DB or in-memory
    try {
      const r = await db.query(
        'SELECT id, client_id, created_at FROM commerce_stores WHERE client_id=$1 LIMIT 100',
        [clientId]
      );
      return res.json({ ok: true, stores: r.rows });
    } catch (e) {
      // fallback to empty
      return res.json({ ok: true, stores: [] });
    }
  });

  return router;
}
