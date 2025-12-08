/**
 * Commerce Bridge Miner
 * Uses the headless extractor and SEO integration to discover product data from URLs
 * and can create auto-stores via the CommerceBridgeService.
 */

import HeadlessExtractor from '../crawler/headlessExtractor.js';
import SEOCrawlerIntegration from '../crawler/SEOCrawlerIntegration.js';
import CommerceBridgeService from './commerce-bridge-service.js';
import { randomUUID } from 'crypto';

class CommerceBridgeMiner {
  constructor(opts = {}) {
    this.db = opts.db || null;
    this.tfManager = opts.tfManager || null;
    this.commerceService = opts.commerceService || new CommerceBridgeService({ db: this.db });
    this.integrator = new SEOCrawlerIntegration({ db: this.db });
  }

  async mineSiteForProducts(url, options = {}) {
    const extractor = new HeadlessExtractor();
    try {
      const analysis = await extractor.extract(url, { timeout: options.timeout || 90000 });

      // Collect schema.org Product entries
      const products = [];
      const schemas = analysis.schemas || [];
      for (const s of schemas) {
        try {
          const type = (s['@type'] || s['type'] || s['schemaType'] || '').toString().toLowerCase();
          if (type.includes('product') || type.includes('offer')) {
            products.push({
              id: s.sku || s.productID || randomUUID(),
              title: s.name || s.title || s['@id'] || null,
              description: s.description || null,
              price: s.price || (s.offers && s.offers.price) || null,
              currency: s.priceCurrency || (s.offers && s.offers.priceCurrency) || 'USD',
              images: s.image ? (Array.isArray(s.image) ? s.image : [s.image]) : [],
              url: s.url || url,
              rawSchema: s,
            });
          }
        } catch (e) {
          // ignore individual schema parse errors
        }
      }

      // Fallback heuristic: look for common product patterns in analysis (very crude)
      if (products.length === 0 && analysis.text) {
        const maybePrice = analysis.text.match(/\$\s?\d{1,5}(?:[.,]\d{2})?/g);
        if (maybePrice && maybePrice.length) {
          products.push({
            id: randomUUID(),
            title: analysis.title || 'Discovered product',
            description: analysis.description || null,
            price: maybePrice[0].replace(/[^0-9.]/g, ''),
            currency: 'USD',
            images: analysis.screenshots ? analysis.screenshots.slice(0, 3) : [],
            url,
            rawSchema: null,
          });
        }
      }

      // Extract backlinks/context useful for store linking
      const backlinks = analysis.backlinks || [];

      return { url, products, backlinks, analysis };
    } finally {
      try {
        await extractor.close();
      } catch (e) {}
    }
  }

  async createBridgeStoreFromSite(clientId, url, options = {}) {
    const result = await this.mineSiteForProducts(url, options);
    if (!result.products || result.products.length === 0) {
      return { ok: false, message: 'No products found', url };
    }

    // Create a bridge (if not exists)
    const bridge = await this.commerceService.createBridgeForClient(clientId, {
      name: options.bridgeName || `AutoStore for ${clientId}`,
    });

    // Create auto-store
    const store = await this.commerceService.createAutoStore({
      bridgeId: bridge.bridgeId,
      clientId,
      products: result.products,
      paymentConfig: options.paymentConfig || null,
    });

    // Optionally save training data for ML
    try {
      if (this.integrator && typeof this.integrator.saveSEOTrainingData === 'function') {
        await this.integrator.saveSEOTrainingData({ url, products: result.products, backlinks: result.backlinks });
      }
    } catch (e) {
      console.warn('Failed to save training data', e?.message || e);
    }

    return { ok: true, bridge, store, found: result.products.length };
  }
}

export default CommerceBridgeMiner;
