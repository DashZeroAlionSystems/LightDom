/**
 * GPU Detection Utility for Headless Chrome
 * 
 * This utility detects GPU support in headless Chrome environments
 * and provides recommendations for optimal Chrome launch configurations.
 * 
 * Based on research from GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md
 */

import puppeteer from 'puppeteer';

export class GPUDetection {
  constructor() {
    this.gpuSupported = null;
    this.gpuDetails = null;
    this.lastCheck = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Detect if GPU hardware acceleration is available in headless Chrome
   * @returns {Promise<Object>} GPU support details
   */
  async detectGPUSupport() {
    // Return cached result if recent
    if (this.gpuSupported !== null && 
        this.lastCheck && 
        (Date.now() - this.lastCheck < this.cacheTimeout)) {
      return {
        supported: this.gpuSupported,
        details: this.gpuDetails,
        cached: true
      };
    }

    let browser;
    try {
      console.log('🔍 Detecting GPU support in headless Chrome...');
      
      // Launch with GPU-enabled flags
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--use-gl=desktop',
          '--enable-gpu-rasterization',
          '--enable-webgl',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      });

      const page = await browser.newPage();
      
      // Navigate to chrome://gpu to check GPU status
      await page.goto('chrome://gpu', { waitUntil: 'networkidle0' });
      const content = await page.evaluate(() => document.body.innerText);

      // Parse GPU information
      const hasHardwareAcceleration = content.includes('Hardware accelerated');
      const gpuProcess = content.includes('GPU Process');
      const openGLEnabled = content.includes('OpenGL enabled');
      const webGLEnabled = content.includes('WebGL') && !content.includes('WebGL: Software only');
      const swiftShader = content.includes('SwiftShader');

      this.gpuSupported = hasHardwareAcceleration && gpuProcess && !swiftShader;
      this.gpuDetails = {
        hardwareAcceleration: hasHardwareAcceleration,
        gpuProcess,
        openGLEnabled,
        webGLEnabled,
        swiftShader,
        rawContent: content.substring(0, 500) // First 500 chars for debugging
      };
      this.lastCheck = Date.now();

      const status = this.gpuSupported ? '✅' : '❌';
      console.log(`${status} GPU Support: ${this.gpuSupported ? 'Available' : 'Not Available'}`);
      
      return {
        supported: this.gpuSupported,
        details: this.gpuDetails,
        cached: false
      };

    } catch (error) {
      console.error('❌ Error detecting GPU support:', error.message);
      this.gpuSupported = false;
      this.gpuDetails = {
        error: error.message,
        stack: error.stack
      };
      this.lastCheck = Date.now();

      return {
        supported: false,
        details: this.gpuDetails,
        cached: false
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Get recommended Chrome launch configuration based on task and environment
   * @param {string} task - Task type (general, visualization, screenshot, video, webgl)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Recommended browser configuration
   */
  async getRecommendedConfig(task = 'general', options = {}) {
    const { forceGPUCheck = false } = options;

    // Check GPU support if not cached or forced
    if (this.gpuSupported === null || forceGPUCheck) {
      await this.detectGPUSupport();
    }

    const baseConfig = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    };

    // Determine if GPU should be enabled for this task
    const gpuBeneficialTasks = ['visualization', 'screenshot', 'video', 'webgl', 'chromelayers'];
    const shouldUseGPU = this.gpuSupported && gpuBeneficialTasks.includes(task.toLowerCase());

    if (shouldUseGPU) {
      // GPU-enabled configuration
      baseConfig.args.push(
        '--use-gl=desktop',
        '--enable-gpu-rasterization',
        '--enable-webgl',
        '--enable-accelerated-2d-canvas',
        '--ignore-gpu-blocklist'
      );
      baseConfig.gpuEnabled = true;
    } else {
      // GPU-disabled configuration (stable, reliable)
      baseConfig.args.push(
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-accelerated-2d-canvas',
        '--disable-features=VizDisplayCompositor'
      );
      baseConfig.gpuEnabled = false;
    }

    // Add performance optimizations
    baseConfig.args.push(
      '--disable-extensions',
      '--disable-plugins',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--memory-pressure-off',
      '--max_old_space_size=4096'
    );

    // Environment-specific optimizations
    if (process.env.NODE_ENV === 'production') {
      baseConfig.args.push(
        '--disable-features=TranslateUI',
        '--disable-sync',
        '--metrics-recording-only'
      );
    }

    return {
      config: baseConfig,
      task,
      gpuSupported: this.gpuSupported,
      gpuEnabled: shouldUseGPU,
      recommendation: shouldUseGPU ? 
        'Using GPU acceleration for graphics-intensive task' : 
        'Using software rendering for stability'
    };
  }

  /**
   * Quick check if task benefits from GPU
   * @param {string} task - Task type
   * @returns {boolean}
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
   * Get GPU status report
   * @returns {Object}
   */
  getStatus() {
    return {
      gpuSupported: this.gpuSupported,
      lastCheck: this.lastCheck,
      details: this.gpuDetails,
      cacheValid: this.lastCheck && (Date.now() - this.lastCheck < this.cacheTimeout)
    };
  }

  /**
   * Clear cached GPU detection results
   */
  clearCache() {
    this.gpuSupported = null;
    this.gpuDetails = null;
    this.lastCheck = null;
  }
}

// Singleton instance for shared usage
export const gpuDetection = new GPUDetection();

// Convenience function
export async function detectGPU() {
  return await gpuDetection.detectGPUSupport();
}

export async function getOptimalConfig(task = 'general', options = {}) {
  return await gpuDetection.getRecommendedConfig(task, options);
}

export default GPUDetection;
