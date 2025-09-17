/**
 * Light DOM Optimizer - Embeddable Script for Real Website Optimization
 * NOTE: This file is intended to be served from /optimizer/light-dom-v1.min.js
 */
(function () {
  class LightDOMOptimizer {
    constructor(options = {}) {
      this.config = {
        apiEndpoint: options.apiEndpoint || location.origin.replace('http', 'https'),
        websiteId: options.websiteId,
        apiKey: options.apiKey,
        enableRealtime: options.enableRealtime !== false,
        enableAI: options.enableAI !== false,
        collectAnalytics: options.collectAnalytics !== false,
        optimizationLevel: options.optimizationLevel || 'aggressive',
        ...options,
      };

      this.optimizations = new Map();
      this.performanceMetrics = {};
      this.elementStats = new Map();
      this.aiModel = null;
      this.socket = null;
      this.observerInstances = [];
      this.analyticsQueue = [];
      this.analyticsBatchTimer = null;
      this.init();
    }
    async init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    }
    async start() {
      try {
        await this.loadAIModel();
        await this.measureBaselinePerformance();
        const analysis = await this.analyzeDOMStructure();
        const plan = await this.generateOptimizationPlan(analysis);
        await this.applyOptimizations(plan);
        this.setupContinuousMonitoring();
        this.connectToOptimizationNetwork();
        await this.reportOptimizationResults();
        console.log('✅ Light DOM Optimizer active');
      } catch (e) {
        console.warn('LightDOMOptimizer error:', e);
      }
    }
    async loadAIModel() {
      try {
        if (typeof tf === 'undefined') {
          await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.16.0');
        }
        this.aiModel = await tf.loadLayersModel(
          `${this.config.apiEndpoint}/ai/dom-optimization-model.json`
        );
      } catch (e) {
        this.aiModel = null;
      }
    }
    async measureBaselinePerformance() {
      this.performanceMetrics.baseline = {
        timestamp: Date.now(),
        domNodes: document.querySelectorAll('*').length,
        totalStylesheets: document.styleSheets.length,
        totalScripts: document.querySelectorAll('script').length,
      };
    }
    calculateDOMDepth() {
      let d = 0;
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let n;
      while ((n = w.nextNode())) {
        let t = 0,
          p = n.parentElement;
        while (p) {
          t++;
          p = p.parentElement;
        }
        d = Math.max(d, t);
      }
      return d;
    }
    async analyzeDOMStructure() {
      const a = {
        structure: { totalElements: 0, elementTypes: new Map() },
        issues: { orphanedElements: [], unusedClasses: [] },
        opportunities: { lazyLoadCandidates: [], deferableScripts: [], inlineableCSS: [] },
      };
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let n;
      while ((n = w.nextNode())) {
        a.structure.totalElements++;
        const t = n.tagName.toLowerCase();
        a.structure.elementTypes.set(t, (a.structure.elementTypes.get(t) || 0) + 1);
        const cs = getComputedStyle(n);
        if (t === 'img' && !n.getAttribute('loading'))
          a.opportunities.lazyLoadCandidates.push({ element: n });
        if (t === 'script' && !n.hasAttribute('defer') && !n.hasAttribute('async'))
          a.opportunities.deferableScripts.push({ element: n });
        if (cs.display === 'none') a.issues.orphanedElements.push({ element: n });
      }
      return a;
    }
    async generateOptimizationPlan(a) {
      return {
        priorityOptimizations: a.opportunities.lazyLoadCandidates.length
          ? [{ type: 'implement-lazy-loading', elements: a.opportunities.lazyLoadCandidates }]
          : [],
        safeOptimizations: a.opportunities.deferableScripts.length
          ? [{ type: 'defer-non-critical-scripts', scripts: a.opportunities.deferableScripts }]
          : [],
        experimentalOptimizations: [],
        aiRecommendations: null,
      };
    }
    async applyOptimizations(plan) {
      for (const opt of plan.priorityOptimizations) {
        await this.applyOptimization(opt);
      }
      for (const opt of plan.safeOptimizations) {
        await this.applyOptimization(opt);
      }
      this.optimizations.set(Date.now(), plan);
    }
    async applyOptimization(opt) {
      if (opt.type === 'implement-lazy-loading') {
        for (const c of opt.elements) {
          const el = c.element;
          if (el.tagName && el.tagName.toLowerCase() === 'img' && !el.getAttribute('loading'))
            el.setAttribute('loading', 'lazy');
        }
      } else if (opt.type === 'defer-non-critical-scripts') {
        for (const s of opt.scripts) {
          const el = s.element;
          if (!el.hasAttribute('defer') && !el.hasAttribute('async')) el.setAttribute('defer', '');
        }
      }
    }
    setupContinuousMonitoring() {
      try {
        const po = new PerformanceObserver(() => {});
        po.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
        this.observerInstances.push(po);
      } catch {}
      const mo = new MutationObserver(() => {});
      mo.observe(document.body, { childList: true, subtree: true, attributes: true });
      this.observerInstances.push(mo);
    }
    connectToOptimizationNetwork() {
      if (!this.config.enableRealtime) return;
      try {
        const wsUrl = (this.config.apiEndpoint || '').replace('http', 'ws') + '/optimize/ws';
        const s = new WebSocket(wsUrl);
        this.socket = s;
        s.onopen = () => {
          try {
            s.send(
              JSON.stringify({
                type: 'handshake',
                websiteId: this.config.websiteId,
                apiKey: this.config.apiKey,
              })
            );
          } catch {}
        };
        s.onmessage = ev => {
          try {
            const data = JSON.parse(ev.data);
            if (data.type === 'new-optimization') {
              this.applyOptimization(data.optimization);
            }
          } catch {}
        };
        s.onclose = () => {
          setTimeout(() => this.connectToOptimizationNetwork(), 5000);
        };
      } catch {}
    }
    async reportOptimizationResults() {
      try {
        await fetch(`${this.config.apiEndpoint}/ai/collect-training-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            websiteId: this.config.websiteId,
            timestamp: Date.now(),
            optimizations: Array.from(this.optimizations.keys()),
          }),
        });
      } catch {}
    }
    async loadScript(src) {
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = res;
        s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    destroy() {
      this.observerInstances.forEach(o => {
        try {
          o.disconnect();
        } catch {}
      });
      if (this.socket) {
        try {
          this.socket.close();
        } catch {}
      }
    }
  }
  // Auto init via meta
  (function () {
    const m = document.querySelector('meta[name="dom-space-optimizer"]');
    if (!m) return;
    const cfg = {
      websiteId: m.getAttribute('data-website-id'),
      apiKey: m.getAttribute('data-api-key'),
      optimizationLevel: m.getAttribute('data-level') || 'moderate',
      enableRealtime: m.getAttribute('data-realtime') !== 'false',
      enableAI: m.getAttribute('data-ai') !== 'false',
    };
    window.DOMSpaceOptimizer = new LightDOMOptimizer(cfg);
  })();
  // Embed helper
  window.generateDOMSpaceEmbed = function (websiteId, apiKey, options = {}) {
    return (
      `\n<!-- DOM Space Optimizer -->\n<meta name="dom-space-optimizer" data-website-id="${websiteId}" data-api-key="${apiKey}" data-level="${options.level || 'moderate'}" data-realtime="${options.realtime !== false}" data-ai="${options.ai !== false}">\n<script src="${(location.origin || '').replace('http', 'https')}/optimizer/light-dom-v1.min.js" async></` +
      `script>`
    );
  };
})();
