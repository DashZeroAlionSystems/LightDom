import { registerClassifierWorker } from '../../orchestrator/src/index.js';

registerClassifierWorker(async job => {
  console.log('[classifier] received batch', job.batchId, 'assets at', job.assetsPath);
});
