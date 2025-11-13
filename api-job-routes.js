/**
 * Job Queue API Routes
 * Endpoints for managing BullMQ job queues
 */

import express from 'express';
import {
  crawlerQueue,
  enqueueCrawl,
  enqueueSEOExtraction,
  enqueueTrainingDataGeneration,
  getAllQueueStats,
  getQueueStats,
  seoExtractionQueue,
  trainingDataQueue,
} from '../services/job-queue.js';

const router = express.Router();

/**
 * POST /api/jobs/seo-extraction
 * Enqueue SEO extraction job
 */
router.post('/seo-extraction', async (req, res) => {
  try {
    const { url, html, crawlSessionId } = req.body;

    if (!url || !html) {
      return res.status(400).json({
        error: 'Missing required fields: url, html',
      });
    }

    const job = await enqueueSEOExtraction({ url, html, crawlSessionId });

    res.json({
      success: true,
      jobId: job.id,
      queueName: 'seo-extraction',
      message: 'SEO extraction job enqueued',
    });
  } catch (error) {
    console.error('Error enqueueing SEO extraction:', error);
    res.status(500).json({
      error: 'Failed to enqueue SEO extraction job',
      details: error.message,
    });
  }
});

/**
 * POST /api/jobs/crawl
 * Enqueue web crawling job
 */
router.post('/crawl', async (req, res) => {
  try {
    const { url, options } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'Missing required field: url',
      });
    }

    const job = await enqueueCrawl({ url, options });

    res.json({
      success: true,
      jobId: job.id,
      queueName: 'web-crawling',
      message: 'Crawl job enqueued',
    });
  } catch (error) {
    console.error('Error enqueueing crawl:', error);
    res.status(500).json({
      error: 'Failed to enqueue crawl job',
      details: error.message,
    });
  }
});

/**
 * POST /api/jobs/training-data
 * Enqueue training data generation job
 */
router.post('/training-data', async (req, res) => {
  try {
    const {
      datasetName,
      minScore = 0,
      maxScore = 100,
      hostnameFilter = null,
      limit = 1000,
      outputPath = './training_data',
    } = req.body;

    if (!datasetName) {
      return res.status(400).json({
        error: 'Missing required field: datasetName',
      });
    }

    const job = await enqueueTrainingDataGeneration({
      datasetName,
      minScore,
      maxScore,
      hostnameFilter,
      limit,
      outputPath,
    });

    res.json({
      success: true,
      jobId: job.id,
      queueName: 'training-data-generation',
      message: 'Training data generation job enqueued',
    });
  } catch (error) {
    console.error('Error enqueueing training data generation:', error);
    res.status(500).json({
      error: 'Failed to enqueue training data generation job',
      details: error.message,
    });
  }
});

/**
 * GET /api/jobs/stats
 * Get statistics for all queues
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getAllQueueStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting queue stats:', error);
    res.status(500).json({
      error: 'Failed to get queue statistics',
      details: error.message,
    });
  }
});

/**
 * GET /api/jobs/stats/:queueName
 * Get statistics for specific queue
 */
router.get('/stats/:queueName', async (req, res) => {
  try {
    const { queueName } = req.params;
    const stats = await getQueueStats(queueName);
    res.json(stats);
  } catch (error) {
    console.error('Error getting queue stats:', error);
    res.status(500).json({
      error: 'Failed to get queue statistics',
      details: error.message,
    });
  }
});

/**
 * GET /api/jobs/:queueName/:jobId
 * Get specific job status
 */
router.get('/:queueName/:jobId', async (req, res) => {
  try {
    const { queueName, jobId } = req.params;

    let queue;
    switch (queueName) {
      case 'seo-extraction':
        queue = seoExtractionQueue;
        break;
      case 'web-crawling':
        queue = crawlerQueue;
        break;
      case 'training-data-generation':
        queue = trainingDataQueue;
        break;
      default:
        return res.status(400).json({ error: 'Invalid queue name' });
    }

    const job = await queue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;
    const returnvalue = job.returnvalue;
    const failedReason = job.failedReason;

    res.json({
      id: job.id,
      name: job.name,
      data: job.data,
      state,
      progress,
      returnvalue,
      failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({
      error: 'Failed to get job status',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/jobs/:queueName/:jobId
 * Remove a job from queue
 */
router.delete('/:queueName/:jobId', async (req, res) => {
  try {
    const { queueName, jobId } = req.params;

    let queue;
    switch (queueName) {
      case 'seo-extraction':
        queue = seoExtractionQueue;
        break;
      case 'web-crawling':
        queue = crawlerQueue;
        break;
      case 'training-data-generation':
        queue = trainingDataQueue;
        break;
      default:
        return res.status(400).json({ error: 'Invalid queue name' });
    }

    const job = await queue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await job.remove();

    res.json({
      success: true,
      message: 'Job removed',
    });
  } catch (error) {
    console.error('Error removing job:', error);
    res.status(500).json({
      error: 'Failed to remove job',
      details: error.message,
    });
  }
});

export default router;
