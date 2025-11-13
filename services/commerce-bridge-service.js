/**
 * Commerce Bridge Service
 * Lightweight, pluggable service to create commerce "bridges" (auto-stores) from
 * discovered product data and backlinks. This file contains a minimal, dependency-free
 * scaffolding that can be extended to integrate with DB, payment gateways, and the
 * existing LightDom extraction pipeline.
 */

import { randomUUID } from 'crypto';

class CommerceBridgeService {
  constructor(opts = {}) {
    this.db = opts.db || null; // optional pg Pool
    this.paymentAdapters = new Map();
    this.stores = new Map(); // in-memory stores for dev
  }

  async createBridgeForClient(clientId, { name, source = 'web', metadata = {} } = {}) {
    const bridgeId = `commerce_bridge_${clientId}_${Date.now()}`;
    const bridge = {
      bridgeId,
      clientId,
      name: name || `AutoStore for ${clientId}`,
      source,
      metadata,
      createdAt: new Date().toISOString(),
    };

    // Try to persist to DB if available (dimensional_bridges table exists in schema)
    if (this.db && typeof this.db.query === 'function') {
      try {
        await this.db.query(
          `INSERT INTO dimensional_bridges (bridge_id, source_chain, target_chain, bridge_capacity, current_volume, is_operational)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (bridge_id) DO NOTHING`,
          [bridgeId, 'commerce', clientId, 100000, 0, true]
        );
      } catch (e) {
        // swallow DB errors in dev mode
        console.warn('CommerceBridgeService.createBridgeForClient: DB insert failed', e?.message || e);
      }
    }

    this.stores.set(bridgeId, { ...bridge, products: [] });
    return bridge;
  }

  generateRichSnippetForProduct(product = {}) {
    // Basic JSON-LD Product snippet generation (schema.org)
    const snippet = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title || product.name || 'Unknown Product',
      image: product.images || (product.image ? [product.image] : []),
      description: product.description || product.summary || '',
      sku: product.sku || product.id || undefined,
      offers: {
        '@type': 'Offer',
        price: product.price != null ? String(product.price) : undefined,
        priceCurrency: product.currency || 'USD',
        url: product.url || undefined,
        availability: product.availability || 'https://schema.org/InStock',
      },
    };

    // Clean undefined fields
    const cleaned = JSON.parse(JSON.stringify(snippet));
    return { snippet: cleaned, snippetString: `<script type="application/ld+json">${JSON.stringify(cleaned)}</script>` };
  }

  async createAutoStore({ bridgeId, clientId, products = [], paymentConfig = null } = {}) {
    if (!bridgeId) bridgeId = `commerce_store_${clientId}_${Date.now()}`;

    const store = {
      id: bridgeId,
      clientId,
      createdAt: new Date().toISOString(),
      products: [],
      payment: paymentConfig || null,
    };

    for (const p of products) {
      const prod = {
        id: p.id || randomUUID(),
        title: p.title || p.name || 'Untitled',
        description: p.description || '',
        price: p.price || null,
        currency: p.currency || 'USD',
        images: p.images || (p.image ? [p.image] : []),
        url: p.url || null,
        metadata: p.metadata || {},
      };
      prod.richSnippet = this.generateRichSnippetForProduct(prod).snippet;
      store.products.push(prod);
    }

    // Persist store to DB if commerce_stores table exists
    if (this.db && typeof this.db.query === 'function') {
      try {
        await this.db.query(
          `INSERT INTO commerce_stores (id, client_id, created_at, metadata) VALUES ($1,$2,$3,$4)
           ON CONFLICT (id) DO NOTHING`,
          [store.id, store.clientId, store.createdAt, JSON.stringify({ productCount: store.products.length })]
        );
      } catch (e) {
        console.warn('CommerceBridgeService.createAutoStore: DB insert failed', e?.message || e);
      }
    }

    this.stores.set(store.id, store);
    return store;
  }

  async linkPaymentGateway(clientId, providerName, providerConfig) {
    // store in memory; in production persist into secure KV or DB (secrets vault)
    this.paymentAdapters.set(clientId, { providerName, providerConfig, updatedAt: new Date().toISOString() });
    return { ok: true };
  }

  async getStore(storeId) {
    if (this.stores.has(storeId)) return this.stores.get(storeId);
    if (this.db && typeof this.db.query === 'function') {
      try {
        const r = await this.db.query('SELECT id, client_id, created_at, metadata FROM commerce_stores WHERE id=$1', [storeId]);
        if (r.rowCount > 0) return r.rows[0];
      } catch (e) {}
    }
    return null;
  }
}

export default CommerceBridgeService;
