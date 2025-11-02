/**
 * Health Check Controllers
 * Handle health check requests
 */

import { successResponse } from '../utils/response.js';
import { getDatabase } from '../../config/database.js';
import config from '../../config/index.js';
import os from 'os';

/**
 * Get basic health status
 */
export const getHealth = async (req, res) => {
  successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  }, 'Server is running');
};

/**
 * Get database health status
 */
export const getDatabaseHealth = async (req, res) => {
  const db = getDatabase();
  
  if (!config.database.enabled) {
    return successResponse(res, {
      status: 'disabled',
      message: 'Database is disabled',
    });
  }
  
  try {
    const startTime = Date.now();
    const result = await db.query('SELECT NOW() as time, version() as version');
    const responseTime = Date.now() - startTime;
    
    successResponse(res, {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      serverTime: result.rows[0].time,
      version: result.rows[0].version,
    }, 'Database is healthy');
  } catch (error) {
    successResponse(res, {
      status: 'unhealthy',
      error: error.message,
    }, 'Database check failed', 503);
  }
};

/**
 * Get system health and metrics
 */
export const getSystemHealth = async (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      process: process.uptime(),
      system: os.uptime(),
    },
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
      process: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0].model,
      load: os.loadavg(),
    },
    platform: {
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
    },
  }, 'System health retrieved');
};

export default {
  getHealth,
  getDatabaseHealth,
  getSystemHealth,
};
