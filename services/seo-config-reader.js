import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_PATH = join(__dirname, '../config/seo-attributes.json');

let cachedConfig = null;

function loadConfig(force = false, configPath = DEFAULT_CONFIG_PATH) {
  if (!cachedConfig || force) {
    const raw = readFileSync(configPath, 'utf-8');
    cachedConfig = JSON.parse(raw);
  }
  return cachedConfig;
}

export function getSEOConfig(options = {}) {
  const { forceReload = false, configPath = DEFAULT_CONFIG_PATH } = options;
  return loadConfig(forceReload, configPath);
}

export function getAttributeConfigs(options = {}) {
  const config = getSEOConfig(options);
  return config.attributes || {};
}

export function getAttributeConfig(attributeName, options = {}) {
  const attributes = getAttributeConfigs(options);
  return attributes[attributeName];
}

export function getAttributeNames(options = {}) {
  return Object.keys(getAttributeConfigs(options));
}

export function getConfigMetadata(options = {}) {
  const config = getSEOConfig(options);
  return config.metadata || {};
}

export function getOptimizationRecommendations(options = {}) {
  const config = getSEOConfig(options);
  return config.optimizationRecommendations || {};
}

export function clearCachedSEOConfig() {
  cachedConfig = null;
}
