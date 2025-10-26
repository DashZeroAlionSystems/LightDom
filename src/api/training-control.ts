/**
 * Training Pipeline Control API
 * Provides endpoints to start, stop, and monitor neural network training
 */

import express from 'express';
import { spawn, ChildProcess } from 'child_process';
import { databaseIntegration } from '../services/DatabaseIntegration.js';

const router = express.Router();

// Track active training processes
const activeTrainingProcesses: Map<string, {
  process: ChildProcess;
  modelType: string;
  startTime: Date;
  status: string;
  progress: number;
  logs: string[];
}> = new Map();

/**
 * Start a new training run
 */
router.post('/training/start', async (req, res) => {
  try {
    const {
      modelType, // 'seo', 'content_title', 'content_description', 'content_full', 'ranking'
      algorithm, // 'gradient_boosting', 'neural_network', 'random_forest', 'xgboost'
      epochs = 100,
      batchSize = 32,
      learningRate = 0.001,
      features = [],
      hyperparameters = {}
    } = req.body;

    if (!modelType) {
      return res.status(400).json({ error: 'Model type is required' });
    }

    // Generate training run ID
    const trainingId = `training_${modelType}_${Date.now()}`;

    // Determine which training script to run
    let scriptPath: string;
    let scriptArgs: string[] = [];

    if (modelType === 'seo') {
      scriptPath = 'src/seo/ml/train_seo_model.py';
      scriptArgs = [
        '--model-name', `seo_model_${Date.now()}`,
        '--algorithm', algorithm || 'gradient_boosting',
        '--output-dir', 'models/seo'
      ];

      if (features.length > 0) {
        scriptArgs.push('--features', features.join(','));
      }
    } else if (modelType.startsWith('content_')) {
      scriptPath = 'src/services/api/AIContentModelTrainer.ts';
      const contentType = modelType.replace('content_', '');
      scriptArgs = [
        '--type', contentType,
        '--epochs', epochs.toString(),
        '--batch-size', batchSize.toString(),
        '--learning-rate', learningRate.toString()
      ];
    } else if (modelType === 'ranking') {
      scriptPath = 'src/seo/ml/RankingPredictor.py';
      scriptArgs = [
        '--train',
        '--epochs', epochs.toString(),
        '--output-dir', 'models/ranking'
      ];
    } else {
      return res.status(400).json({ error: 'Invalid model type' });
    }

    // Spawn training process
    const trainingProcess = spawn('python3', [scriptPath, ...scriptArgs], {
      cwd: process.cwd(),
      env: { ...process.env }
    });

    // Track the process
    activeTrainingProcesses.set(trainingId, {
      process: trainingProcess,
      modelType,
      startTime: new Date(),
      status: 'running',
      progress: 0,
      logs: []
    });

    // Capture stdout
    trainingProcess.stdout?.on('data', (data) => {
      const log = data.toString();
      const training = activeTrainingProcesses.get(trainingId);
      if (training) {
        training.logs.push(log);

        // Parse progress from logs (looking for epoch numbers)
        const epochMatch = log.match(/Epoch (\d+)\/(\d+)/);
        if (epochMatch) {
          const current = parseInt(epochMatch[1]);
          const total = parseInt(epochMatch[2]);
          training.progress = Math.round((current / total) * 100);
        }
      }
      console.log(`[${trainingId}] ${log}`);
    });

    // Capture stderr
    trainingProcess.stderr?.on('data', (data) => {
      const log = data.toString();
      const training = activeTrainingProcesses.get(trainingId);
      if (training) {
        training.logs.push(`ERROR: ${log}`);
      }
      console.error(`[${trainingId}] ERROR: ${log}`);
    });

    // Handle process completion
    trainingProcess.on('close', async (code) => {
      const training = activeTrainingProcesses.get(trainingId);
      if (training) {
        training.status = code === 0 ? 'completed' : 'failed';
        training.progress = 100;

        // Record to database
        try {
          await databaseIntegration.query(
            `INSERT INTO seo_features.model_training_runs (
              model_name, model_version, dataset_size, training_start_date,
              training_end_date, status, hyperparameters
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              modelType,
              `v${Date.now()}`,
              0, // Will be updated by the training script
              training.startTime,
              new Date(),
              training.status,
              JSON.stringify({ algorithm, epochs, batchSize, learningRate, ...hyperparameters })
            ]
          );
        } catch (err) {
          console.error('Failed to record training run:', err);
        }
      }
      console.log(`[${trainingId}] Process exited with code ${code}`);
    });

    res.json({
      success: true,
      trainingId,
      message: `Training started for ${modelType} model`,
      status: 'running'
    });

  } catch (error) {
    console.error('Error starting training:', error);
    res.status(500).json({
      error: 'Failed to start training',
      message: error.message
    });
  }
});

/**
 * Stop an active training run
 */
router.post('/training/:trainingId/stop', (req, res) => {
  try {
    const { trainingId } = req.params;
    const training = activeTrainingProcesses.get(trainingId);

    if (!training) {
      return res.status(404).json({ error: 'Training run not found' });
    }

    if (training.status !== 'running') {
      return res.status(400).json({ error: 'Training is not running' });
    }

    // Kill the process
    training.process.kill('SIGTERM');
    training.status = 'stopped';

    res.json({
      success: true,
      message: 'Training stopped successfully',
      trainingId
    });

  } catch (error) {
    console.error('Error stopping training:', error);
    res.status(500).json({
      error: 'Failed to stop training',
      message: error.message
    });
  }
});

/**
 * Get training run status
 */
router.get('/training/:trainingId/status', (req, res) => {
  try {
    const { trainingId } = req.params;
    const training = activeTrainingProcesses.get(trainingId);

    if (!training) {
      return res.status(404).json({ error: 'Training run not found' });
    }

    res.json({
      trainingId,
      modelType: training.modelType,
      status: training.status,
      progress: training.progress,
      startTime: training.startTime,
      duration: Date.now() - training.startTime.getTime(),
      recentLogs: training.logs.slice(-10) // Last 10 log lines
    });

  } catch (error) {
    console.error('Error getting training status:', error);
    res.status(500).json({
      error: 'Failed to get training status',
      message: error.message
    });
  }
});

/**
 * List all training runs
 */
router.get('/training/runs', (req, res) => {
  try {
    const runs = Array.from(activeTrainingProcesses.entries()).map(([id, training]) => ({
      trainingId: id,
      modelType: training.modelType,
      status: training.status,
      progress: training.progress,
      startTime: training.startTime,
      duration: Date.now() - training.startTime.getTime()
    }));

    res.json({
      totalRuns: runs.length,
      activeRuns: runs.filter(r => r.status === 'running').length,
      runs
    });

  } catch (error) {
    console.error('Error listing training runs:', error);
    res.status(500).json({
      error: 'Failed to list training runs',
      message: error.message
    });
  }
});

/**
 * Get training history from database
 */
router.get('/training/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    await databaseIntegration.initialize();

    const result = await databaseIntegration.query(
      `SELECT
        id, model_name, model_version, dataset_size,
        training_start_date, training_end_date, status,
        accuracy_score, hyperparameters
       FROM seo_features.model_training_runs
       ORDER BY training_start_date DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      total: result.rows.length,
      history: result.rows
    });

  } catch (error) {
    console.error('Error getting training history:', error);
    res.status(500).json({
      error: 'Failed to get training history',
      message: error.message
    });
  }
});

/**
 * Get training metrics and performance
 */
router.get('/training/metrics', async (req, res) => {
  try {
    await databaseIntegration.initialize();

    // Get overall training metrics
    const metricsResult = await databaseIntegration.query(`
      SELECT
        COUNT(*) as total_training_runs,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_runs,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
        AVG(accuracy_score) as avg_accuracy,
        AVG(EXTRACT(EPOCH FROM (training_end_date - training_start_date))) as avg_duration_seconds
      FROM seo_features.model_training_runs
      WHERE training_start_date > NOW() - INTERVAL '30 days'
    `);

    // Get model-specific metrics
    const modelMetrics = await databaseIntegration.query(`
      SELECT
        model_name,
        COUNT(*) as runs,
        AVG(accuracy_score) as avg_accuracy,
        MAX(accuracy_score) as best_accuracy,
        MAX(training_end_date) as last_trained
      FROM seo_features.model_training_runs
      WHERE status = 'completed'
      GROUP BY model_name
      ORDER BY last_trained DESC
    `);

    res.json({
      overall: metricsResult.rows[0],
      byModel: modelMetrics.rows
    });

  } catch (error) {
    console.error('Error getting training metrics:', error);
    res.status(500).json({
      error: 'Failed to get training metrics',
      message: error.message
    });
  }
});

/**
 * Cleanup completed training processes
 */
router.post('/training/cleanup', (req, res) => {
  try {
    let cleaned = 0;

    activeTrainingProcesses.forEach((training, id) => {
      if (training.status === 'completed' || training.status === 'failed') {
        activeTrainingProcesses.delete(id);
        cleaned++;
      }
    });

    res.json({
      success: true,
      message: `Cleaned up ${cleaned} completed training runs`,
      cleaned
    });

  } catch (error) {
    console.error('Error cleaning up training runs:', error);
    res.status(500).json({
      error: 'Failed to cleanup training runs',
      message: error.message
    });
  }
});

export default router;
