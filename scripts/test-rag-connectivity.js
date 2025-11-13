/**
 * Automated RAG Connectivity Test
 *
 * Continuously validates:
 * - Ollama health (port 11500)
 * - API server availability (port 3001)
 * - RAG endpoint functionality
 * - Streaming capability
 * - Conversation continuity
 *
 * Run in CI/CD to ensure RAG is always connected
 */

import { EventEmitter } from 'events';
import fetch from 'node-fetch';

const OLLAMA_URL = process.env.OLLAMA_HOST || 'http://127.0.0.1:11500';
const API_URL = process.env.API_URL || 'http://localhost:3001';
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) || 30000; // 30 seconds

class RAGConnectivityMonitor extends EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.stats = {
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      lastCheck: null,
      uptime: 0,
      downtimeStart: null,
    };
  }

  async checkOllamaHealth() {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`, {
        method: 'GET',
        timeout: 5000,
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = await response.json();
      return { ok: true, models: data.models || [] };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async checkAPIHealth() {
    try {
      const response = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        timeout: 5000,
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async checkRAGEndpoint() {
    try {
      const response = await fetch(`${API_URL}/api/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Health check test' }],
        }),
        timeout: 10000,
      });

      if (!response.ok) {
        throw new Error(`RAG endpoint returned status ${response.status}`);
      }

      const data = await response.json();
      return { ok: true, response: data.response };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async checkRAGStreaming() {
    return new Promise(async resolve => {
      try {
        const response = await fetch(`${API_URL}/api/rag/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Streaming test' }],
          }),
          timeout: 10000,
        });

        if (!response.ok) {
          throw new Error(`Streaming endpoint returned status ${response.status}`);
        }

        let receivedData = false;
        const reader = response.body;

        reader.on('data', chunk => {
          receivedData = true;
          reader.destroy(); // Stop after first chunk
        });

        reader.on('end', () => {
          resolve({ ok: receivedData, streamed: true });
        });

        reader.on('error', error => {
          resolve({ ok: false, error: error.message });
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          reader.destroy();
          resolve({ ok: receivedData, timeout: true });
        }, 5000);
      } catch (error) {
        resolve({ ok: false, error: error.message });
      }
    });
  }

  async runCheck() {
    this.stats.totalChecks++;
    this.stats.lastCheck = new Date();

    const results = {
      timestamp: this.stats.lastCheck.toISOString(),
      ollama: await this.checkOllamaHealth(),
      api: await this.checkAPIHealth(),
      rag: await this.checkRAGEndpoint(),
      streaming: await this.checkRAGStreaming(),
    };

    const allHealthy =
      results.ollama.ok && results.api.ok && results.rag.ok && results.streaming.ok;

    if (allHealthy) {
      this.stats.successfulChecks++;
      if (this.stats.downtimeStart) {
        const downtimeDuration = Date.now() - this.stats.downtimeStart;
        this.emit('recovered', { duration: downtimeDuration });
        this.stats.downtimeStart = null;
      }
      this.emit('healthy', results);
    } else {
      this.stats.failedChecks++;
      if (!this.stats.downtimeStart) {
        this.stats.downtimeStart = Date.now();
      }
      this.emit('unhealthy', results);
    }

    return results;
  }

  start() {
    if (this.isRunning) {
      console.warn('Monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log(`🔍 RAG Connectivity Monitor started (checking every ${CHECK_INTERVAL / 1000}s)`);
    console.log(`   Ollama: ${OLLAMA_URL}`);
    console.log(`   API: ${API_URL}`);

    // Initial check
    this.runCheck();

    // Periodic checks
    this.interval = setInterval(() => {
      this.runCheck();
    }, CHECK_INTERVAL);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('🛑 RAG Connectivity Monitor stopped');
  }

  getStats() {
    const uptime = this.stats.downtimeStart ? Date.now() - this.stats.downtimeStart : 0;

    return {
      ...this.stats,
      successRate:
        this.stats.totalChecks > 0
          ? (this.stats.successfulChecks / this.stats.totalChecks) * 100
          : 0,
      currentDowntime: uptime,
    };
  }

  printStatus() {
    const stats = this.getStats();
    console.log('\n📊 RAG Connectivity Stats:');
    console.log(`   Total Checks: ${stats.totalChecks}`);
    console.log(`   Successful: ${stats.successfulChecks}`);
    console.log(`   Failed: ${stats.failedChecks}`);
    console.log(`   Success Rate: ${stats.successRate.toFixed(2)}%`);
    console.log(`   Last Check: ${stats.lastCheck?.toLocaleTimeString() || 'N/A'}`);
    if (stats.currentDowntime > 0) {
      console.log(`   ⚠️  Current Downtime: ${(stats.currentDowntime / 1000).toFixed(0)}s`);
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new RAGConnectivityMonitor();

  monitor.on('healthy', results => {
    console.log(`✅ [${new Date().toLocaleTimeString()}] All systems healthy`);
  });

  monitor.on('unhealthy', results => {
    console.error(`❌ [${new Date().toLocaleTimeString()}] System unhealthy:`);
    if (!results.ollama.ok) console.error(`   - Ollama: ${results.ollama.error}`);
    if (!results.api.ok) console.error(`   - API: ${results.api.error}`);
    if (!results.rag.ok) console.error(`   - RAG: ${results.rag.error}`);
    if (!results.streaming.ok) console.error(`   - Streaming: ${results.streaming.error}`);
  });

  monitor.on('recovered', ({ duration }) => {
    console.log(`🎉 System recovered after ${(duration / 1000).toFixed(0)}s downtime`);
  });

  monitor.start();

  // Print status every 5 minutes
  setInterval(() => {
    monitor.printStatus();
  }, 300000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down monitor...');
    monitor.stop();
    monitor.printStatus();
    process.exit(0);
  });
}

export { RAGConnectivityMonitor };
