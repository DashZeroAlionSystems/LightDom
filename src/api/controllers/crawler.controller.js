/**
 * Crawler Controllers
 * Handle web crawling operations
 */

import { successResponse, createdResponse } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';

// This will be implemented with the actual crawler service
// For now, we create stubs that can be filled in

const crawlerServiceBaseUrl = process.env.CRAWLER_SERVICE_URL || 'http://127.0.0.1:4300';
const crawlerServiceTimeoutMs = Number(process.env.CRAWLER_SERVICE_TIMEOUT_MS || 10000);

const crawlerServiceEndpoints = {
  start: { path: '/start', method: 'POST' },
  stop: { path: '/stop', method: 'POST' },
  status: { path: '/status', method: 'GET' },
};

async function forwardCrawlerServiceRequest(action) {
  const config = crawlerServiceEndpoints[action];
  if (!config) {
    throw new ApiError(400, `Unsupported crawler service action: ${action}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), crawlerServiceTimeoutMs);

  try {
    const response = await fetch(`${crawlerServiceBaseUrl}${config.path}`, {
      method: config.method,
      headers: config.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!response.ok) {
      const message = data?.error || data?.message || response.statusText;
      throw new ApiError(response.status, `Crawler service ${action} failed: ${message}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError(504, `Crawler service ${action} request timed out`);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(502, `Crawler service ${action} request failed: ${error.message}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Start a new crawling session
 */
export const startCrawler = async (req, res) => {
  const { url, options } = req.body;
  
  if (!url) {
    throw new ApiError(400, 'URL is required');
  }
  
  // TODO: Integrate with actual RealWebCrawlerSystem
  // const crawlerSystem = await getCrawlerSystem();
  // const session = await crawlerSystem.startCrawl(url, options);
  
  const sessionId = `session_${Date.now()}`;
  
  createdResponse(res, {
    sessionId,
    url,
    status: 'started',
    startedAt: new Date().toISOString(),
  }, 'Crawler started successfully');
};

/**
 * Stop a crawling session
 */
export const stopCrawler = async (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    throw new ApiError(400, 'Session ID is required');
  }
  
  // TODO: Stop actual crawler session
  // await crawlerSystem.stopCrawl(sessionId);
  
  successResponse(res, {
    sessionId,
    status: 'stopped',
    stoppedAt: new Date().toISOString(),
  }, 'Crawler stopped successfully');
};

/**
 * Get crawler status
 */
export const getCrawlerStatus = async (req, res) => {
  // TODO: Get actual crawler status
  // const status = await crawlerSystem.getStatus();
  
  successResponse(res, {
    active: false,
    sessions: 0,
    totalCrawled: 0,
  }, 'Crawler status retrieved');
};

/**
 * Crawl a single page
 */
export const crawlOnce = async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    throw new ApiError(400, 'URL is required');
  }
  
  // TODO: Perform actual crawl
  // const result = await crawlerSystem.crawlOnce(url);
  
  successResponse(res, {
    url,
    crawledAt: new Date().toISOString(),
    // ...result
  }, 'Page crawled successfully');
};

/**
 * Get all crawling sessions
 */
export const getSessions = async (req, res) => {
  // TODO: Get sessions from database
  const sessions = [];
  
  successResponse(res, sessions, 'Sessions retrieved');
};

/**
 * Get specific session details
 */
export const getSession = async (req, res) => {
  const { sessionId } = req.params;
  
  // TODO: Get session from database
  // const session = await getSessionById(sessionId);
  // if (!session) {
  //   throw new ApiError(404, 'Session not found');
  // }
  
  // Temporary placeholder
  if (!sessionId || sessionId.length === 0) {
    throw new ApiError(400, 'Session ID is required');
  }
  
  successResponse(res, {
    sessionId,
    // ...session
  }, 'Session retrieved');
};

/**
 * Control the long-running crawler service (start/stop/status)
 */
export const controlCrawlerService = async (req, res) => {
  const action = (req.body?.action || req.query?.action || 'status').toString().toLowerCase();

  if (!['start', 'stop', 'status'].includes(action)) {
    throw new ApiError(400, 'Action must be one of: start, stop, status');
  }

  const response = await forwardCrawlerServiceRequest(action);

  successResponse(
    res,
    {
      action,
      crawlerServiceBaseUrl,
      response,
    },
    `Crawler service ${action} request completed`
  );
};

export default {
  startCrawler,
  stopCrawler,
  getCrawlerStatus,
  crawlOnce,
  getSessions,
  getSession,
  controlCrawlerService,
};
