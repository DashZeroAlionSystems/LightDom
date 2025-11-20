/**
 * DeepSeek ↔ Ollama adapter
 * Provide a small set of helper functions DeepSeek can call via the existing
 * DeepSeek routes. This module will attempt to call a local Ollama server if
 * available, otherwise it returns heuristics and templates useful for mining.
 */

import { spawnSync } from 'child_process';

async function ollamaAvailable() {
  try {
    const r = spawnSync('ollama', ['version'], { encoding: 'utf8' });
    return r.status === 0;
  } catch (e) {
    return false;
  }
}

export async function generateMiningConfigFromTopic(topic, opts = {}) {
  // If Ollama is available we could call it with a prompt to synthesize a config
  if (await ollamaAvailable()) {
    // For now, return a simple template — integration can be extended to actually call Ollama
    return {
      startUrl: opts.startUrl || `https://www.google.com/search?q=${encodeURIComponent(topic)}`,
      crawlDepth: opts.crawlDepth || 2,
      selectors: opts.selectors || [
        '[itemtype="http://schema.org/Product"]',
        'article',
        '.product',
      ],
      attributes: opts.attributes || ['name', 'description', 'price', 'image', 'sku', 'offers'],
      needs_training_data: !!opts.needs_training_data,
      generatedBy: 'ollama-adapter',
      topic,
    };
  }

  // Fallback heuristic
  return {
    startUrl: opts.startUrl || `https://www.google.com/search?q=${encodeURIComponent(topic)}`,
    crawlDepth: opts.crawlDepth || 1,
    selectors: opts.selectors || ['[itemtype*="Product"]', '.product', '.schema-product'],
    attributes: opts.attributes || ['name', 'price', 'image', 'description'],
    needs_training_data: !!opts.needs_training_data,
    generatedBy: 'heuristic-adapter',
    topic,
  };
}

export async function analyzeTopicWithDeepSeek(topic, opts = {}) {
  // This function is a stub that returns an analysis object that DeepSeek can consume.
  // In production, call the Ollama model or the DeepSeek API and return structured results.
  return {
    topic,
    summary: `LightDom heuristic analysis for topic: ${topic}`,
    recommendedCrawlConfig: await generateMiningConfigFromTopic(topic, opts),
  };
}

export default { generateMiningConfigFromTopic, analyzeTopicWithDeepSeek };
