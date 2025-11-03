/**
 * Adaptive Browser Configuration Service
 * 
 * Provides intelligent Chrome configuration based on task type, environment,
 * and GPU availability. Implements adaptive learning rate concepts for
 * performance optimization.
 * 
 * Based on research from GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md
 */

import { gpuDetection } from './GPUDetection.js';

export class AdaptiveBrowserConfig {
  constructor(options = {}) {
    this.gpuSupported = false;
    this.environment = process.env.NODE_ENV || 'development';
    this.initialized = false;
    
    // Learning rate for adaptive adjustments
    this.learningRate = options.learningRate || 0.1;
    
    // Performance tracking
    this.performanceHistory = new Map();
    
    // Configuration presets
    this.presets = this.initializePresets();
  }

  /**
   * Initialize the service and detect GPU support
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('🚀 Initializing Adaptive Browser Configuration Service...');
    
    const gpuCheck = await gpuDetection.detectGPUSupport();
    this.gpuSupported = gpuCheck.supported;
    
    console.log(`Environment: ${this.environment}`);
    console.log(`GPU Support: ${this.gpuSupported ? '✅ Available' : '❌ Not Available'}`);
    console.log(`Learning Rate: ${this.learningRate}`);
    
    this.initialized = true;
  }

  /**
   * Get optimized browser configuration for specific task
   * @param {Object} options - Configuration options
   * @returns {Object} Browser launch configuration
   */
  async getConfig(options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const {
      task = 'general',
      enableGPU = false,
      preset = null,
      windowSize = { width: 1920, height: 1080 },
      customArgs = []
    } = options;

    // Use preset if specified
    if (preset && this.presets[preset]) {
      return this.applyPreset(preset, options);
    }

    // Build configuration
    const config = {
      headless: 'new',
      args: [
        // Core stability flags
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      defaultViewport: windowSize
    };

    // GPU decision logic
    const useGPU = enableGPU && this.gpuSupported && this.isGPUBeneficial(task);
    
    if (useGPU) {
      this.addGPUFlags(config);
    } else {
      this.addStableFlags(config);
    }

    // Environment-specific optimizations
    this.addEnvironmentFlags(config);

    // Add custom arguments
    if (customArgs.length > 0) {
      config.args.push(...customArgs);
    }

    // Add metadata
    config.metadata = {
      task,
      gpuEnabled: useGPU,
      environment: this.environment,
      timestamp: Date.now()
    };

    return config;
  }

  /**
   * Add GPU acceleration flags
   */
  addGPUFlags(config) {
    config.args.push(
      '--use-gl=desktop',
      '--enable-gpu-rasterization',
      '--enable-webgl',
      '--enable-accelerated-2d-canvas',
      '--ignore-gpu-blocklist'
    );
  }

  /**
   * Add stable (GPU-disabled) flags
   */
  addStableFlags(config) {
    config.args.push(
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-accelerated-2d-canvas',
      '--disable-features=VizDisplayCompositor'
    );
  }

  /**
   * Add environment-specific flags
   */
  addEnvironmentFlags(config) {
    // Common performance optimizations
    config.args.push(
      '--disable-extensions',
      '--disable-plugins',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--memory-pressure-off',
      '--max_old_space_size=4096'
    );

    // Production optimizations
    if (this.environment === 'production') {
      config.args.push(
        '--disable-features=TranslateUI',
        '--disable-sync',
        '--metrics-recording-only',
        '--disable-notifications',
        '--disable-component-extensions-with-background-pages'
      );
    }

    // Development conveniences
    if (this.environment === 'development') {
      // Keep more debugging capabilities
      config.args.push(
        '--enable-logging',
        '--v=1'
      );
    }

    // CI/CD optimizations
    if (process.env.CI === 'true') {
      config.args.push(
        '--disable-gpu',
        '--single-process', // Simplify process model
        '--no-zygote'
      );
    }
  }

  /**
   * Apply configuration preset
   */
  applyPreset(presetName, options = {}) {
    const preset = this.presets[presetName];
    if (!preset) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    const config = {
      ...preset.config,
      metadata: {
        preset: presetName,
        description: preset.description,
        timestamp: Date.now()
      }
    };

    // Override with custom options
    if (options.windowSize) {
      config.defaultViewport = options.windowSize;
    }

    return config;
  }

  /**
   * Initialize configuration presets
   */
  initializePresets() {
    return {
      // Fast scraping (minimal resources)
      scraping: {
        description: 'Optimized for fast web scraping with minimal resources',
        config: {
          headless: 'new',
          args: [
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images', // Don't load images
            '--window-size=1280,720'
          ],
          defaultViewport: { width: 1280, height: 720 }
        }
      },

      // High-quality screenshots
      screenshot: {
        description: 'Optimized for high-quality screenshot generation',
        config: {
          headless: 'new',
          args: [
            this.gpuSupported ? '--use-gl=desktop' : '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1920,1080',
            '--force-device-scale-factor=1'
          ],
          defaultViewport: { width: 1920, height: 1080 }
        }
      },

      // SEO analysis
      seo: {
        description: 'Optimized for SEO analysis and content extraction',
        config: {
          headless: 'new',
          args: [
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--window-size=1920,1080'
          ],
          defaultViewport: { width: 1920, height: 1080 }
        }
      },

      // Visualization rendering
      visualization: {
        description: 'Optimized for graphics-intensive visualizations',
        config: {
          headless: 'new',
          args: [
            this.gpuSupported ? '--use-gl=desktop' : '--disable-gpu',
            this.gpuSupported ? '--enable-gpu-rasterization' : '',
            this.gpuSupported ? '--enable-webgl' : '',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1920,1080'
          ].filter(arg => arg !== ''),
          defaultViewport: { width: 1920, height: 1080 }
        }
      },

      // CI/CD testing
      ci: {
        description: 'Optimized for CI/CD environments',
        config: {
          headless: 'new',
          args: [
            '--disable-gpu',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote',
            '--disable-extensions',
            '--window-size=1280,720'
          ],
          defaultViewport: { width: 1280, height: 720 }
        }
      }
    };
  }

  /**
   * Check if task benefits from GPU
   */
  isGPUBeneficial(task) {
    const gpuBeneficialTasks = [
      'visualization',
      'screenshot',
      'video',
      'webgl',
      'chromelayers',
      'animation',
      'canvas',
      '3d',
      'graphics'
    ];
    return gpuBeneficialTasks.some(t => 
      task.toLowerCase().includes(t)
    );
  }

  /**
   * Record performance metrics for adaptive learning
   */
  recordPerformance(task, metrics) {
    if (!this.performanceHistory.has(task)) {
      this.performanceHistory.set(task, []);
    }

    const history = this.performanceHistory.get(task);
    history.push({
      ...metrics,
      timestamp: Date.now()
    });

    // Keep last 100 entries per task
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Get performance statistics for a task
   */
  getPerformanceStats(task) {
    const history = this.performanceHistory.get(task);
    if (!history || history.length === 0) {
      return null;
    }

    const responseTimes = history.map(h => h.responseTime || 0);
    const errorRates = history.map(h => h.error ? 1 : 0);

    return {
      task,
      sampleCount: history.length,
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      errorRate: errorRates.reduce((a, b) => a + b, 0) / errorRates.length,
      lastUpdate: history[history.length - 1].timestamp
    };
  }

  /**
   * Get all available presets
   */
  getAvailablePresets() {
    return Object.keys(this.presets).map(key => ({
      name: key,
      description: this.presets[key].description
    }));
  }

  /**
   * Get current configuration status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      environment: this.environment,
      gpuSupported: this.gpuSupported,
      learningRate: this.learningRate,
      trackedTasks: Array.from(this.performanceHistory.keys()),
      presets: this.getAvailablePresets()
    };
  }
}

// Singleton instance
export const adaptiveBrowserConfig = new AdaptiveBrowserConfig();

// Convenience functions
export async function getBrowserConfig(options) {
  return await adaptiveBrowserConfig.getConfig(options);
}

export function recordTaskPerformance(task, metrics) {
  adaptiveBrowserConfig.recordPerformance(task, metrics);
}

export default AdaptiveBrowserConfig;
