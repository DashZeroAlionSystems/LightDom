/**
 * API Routes Configuration
 * Centralized routing for all LightDom APIs including persistent storage
 */

import { Router } from 'express';
import { optimizationAPI } from './optimizationApi';
import { blockchainModelStorageAPI } from './blockchainModelStorageApi';
import { lightDomStorageAPI } from './LightDomStorageApi';
import { startupScript } from '../scripts/StartupScript';
import { browserRefreshHandler } from '../scripts/BrowserRefreshHandler';
import { persistentBlockchainStorage } from '../core/PersistentBlockchainStorage';

const router = Router();

// Optimization API routes
router.post('/optimization/submit', optimizationAPI.submitOptimization.bind(optimizationAPI));
router.get('/optimization/list', optimizationAPI.getOptimizations.bind(optimizationAPI));
router.get('/optimization/:proofHash', optimizationAPI.getOptimization.bind(optimizationAPI));
router.get('/harvester/:address', optimizationAPI.getHarvesterStats.bind(optimizationAPI));
router.get('/harvester/list', optimizationAPI.getHarvesters.bind(optimizationAPI));
router.get('/metaverse/stats', optimizationAPI.getMetaverseStats.bind(optimizationAPI));
router.get('/metaverse/assets', optimizationAPI.getMetaverseAssets.bind(optimizationAPI));
router.get('/analytics/optimization', optimizationAPI.getOptimizationAnalytics.bind(optimizationAPI));
router.get('/feed/optimizations', optimizationAPI.getOptimizationFeed.bind(optimizationAPI));

// Blockchain Model Storage API routes
router.post('/blockchain-models/store', blockchainModelStorageAPI.storeModelData.bind(blockchainModelStorageAPI));
router.get('/blockchain-models/:modelId', blockchainModelStorageAPI.getModelData.bind(blockchainModelStorageAPI));
router.put('/blockchain-models/:modelId', blockchainModelStorageAPI.updateModelData.bind(blockchainModelStorageAPI));
router.delete('/blockchain-models/:modelId', blockchainModelStorageAPI.deleteModelData.bind(blockchainModelStorageAPI));
router.get('/blockchain-models/ids', blockchainModelStorageAPI.getAllModelIds.bind(blockchainModelStorageAPI));
router.get('/blockchain-models/count', blockchainModelStorageAPI.getModelCount.bind(blockchainModelStorageAPI));
router.post('/blockchain-models/search', blockchainModelStorageAPI.searchModels.bind(blockchainModelStorageAPI));
router.get('/blockchain-models/statistics', blockchainModelStorageAPI.getModelStatistics.bind(blockchainModelStorageAPI));
router.post('/blockchain-models/admin/add', blockchainModelStorageAPI.addAdmin.bind(blockchainModelStorageAPI));
router.delete('/blockchain-models/admin/remove', blockchainModelStorageAPI.removeAdmin.bind(blockchainModelStorageAPI));
router.get('/blockchain-models/admin/list', blockchainModelStorageAPI.getAdminAccess.bind(blockchainModelStorageAPI));
router.get('/blockchain-models/all', blockchainModelStorageAPI.getAllModels.bind(blockchainModelStorageAPI));
router.get('/blockchain-models/admin/verify', blockchainModelStorageAPI.verifyAdminAccess.bind(blockchainModelStorageAPI));

// Light DOM Storage API routes
router.get('/storage/settings', lightDomStorageAPI.getStorageSettings.bind(lightDomStorageAPI));
router.put('/storage/settings', lightDomStorageAPI.updateStorageSettings.bind(lightDomStorageAPI));
router.post('/storage/upload', lightDomStorageAPI.uploadFile.bind(lightDomStorageAPI));
router.get('/storage/files', lightDomStorageAPI.getUploadedFiles.bind(lightDomStorageAPI));
router.delete('/storage/files/:fileId', lightDomStorageAPI.deleteUploadedFile.bind(lightDomStorageAPI));
router.get('/storage/stats', lightDomStorageAPI.getStorageStats.bind(lightDomStorageAPI));
router.get('/storage/limits', lightDomStorageAPI.getFileUploadLimits.bind(lightDomStorageAPI));

// Startup and Refresh Handler routes
router.get('/startup/status', (req, res) => {
  try {
    const status = startupScript.getStartupStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/startup/restart', async (req, res) => {
  try {
    const result = await startupScript.forceRestart();
    res.json({
      success: result.success,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/refresh/save', async (req, res) => {
  try {
    const result = await browserRefreshHandler.forceSave();
    res.json({
      success: result.success,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/refresh/status', (req, res) => {
  try {
    const status = browserRefreshHandler.getSaveStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/refresh/restore', async (req, res) => {
  try {
    const restored = await browserRefreshHandler.restoreFromBackup();
    res.json({
      success: restored,
      message: restored ? 'Data restored from backup' : 'No backup data found'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Persistent Storage routes
router.get('/persistent/data', async (req, res) => {
  try {
    const data = await persistentBlockchainStorage.loadAllData();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/persistent/stats', async (req, res) => {
  try {
    const stats = await persistentBlockchainStorage.getStorageStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/persistent/sync', async (req, res) => {
  try {
    await persistentBlockchainStorage.syncWithBlockchain();
    res.json({
      success: true,
      message: 'Data synced with blockchain successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/persistent/clear', async (req, res) => {
  try {
    await persistentBlockchainStorage.clearAllData();
    res.json({
      success: true,
      message: 'All persistent data cleared'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/persistent/export', async (req, res) => {
  try {
    const data = await persistentBlockchainStorage.exportData();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/persistent/import', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Data is required for import'
      });
      return;
    }

    await persistentBlockchainStorage.importData(data);
    res.json({
      success: true,
      message: 'Data imported successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// User Settings routes
router.get('/settings', (req, res) => {
  try {
    const settings = persistentBlockchainStorage.getUserSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/settings', (req, res) => {
  try {
    const { updates } = req.body;
    if (!updates) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Updates are required'
      });
      return;
    }

    persistentBlockchainStorage.updateUserSettings(updates);
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check route
router.get('/health', (req, res) => {
  try {
    const startupStatus = startupScript.getStartupStatus();
    const refreshStatus = browserRefreshHandler.getSaveStatus();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        startup: startupStatus,
        refresh: refreshStatus,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
